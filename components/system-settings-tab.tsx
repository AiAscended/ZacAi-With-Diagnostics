"use client"

import { Input } from "@/components/ui/input"

import { useEffect } from "react"

import { useState } from "react"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, RotateCcw, Download, Upload } from "lucide-react"

interface SystemSettings {
  responseSpeed: number
  memoryRetention: number
  learningRate: number
  confidenceThreshold: number
  maxConversationHistory: number
  enableMathMode: boolean
  enableMemoryLearning: boolean
  enablePerformanceLogging: boolean
  defaultLanguage: string
  responseStyle: string
  debugMode: boolean
  autoSave: boolean
  enableContinuousLearning: boolean
  apiFallback: boolean
}

export default function SystemSettingsTab() {
  const [settings, setSettings] = useState<SystemSettings>({
    responseSpeed: 75,
    memoryRetention: 80,
    learningRate: 60,
    confidenceThreshold: 70,
    maxConversationHistory: 100,
    enableMathMode: true,
    enableMemoryLearning: true,
    enablePerformanceLogging: true,
    defaultLanguage: "english",
    responseStyle: "balanced",
    debugMode: false,
    autoSave: true,
    enableContinuousLearning: true,
    apiFallback: true,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("zacai-system-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }
  }, [])

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("zacai-system-settings", JSON.stringify(settings))
      setHasChanges(false)
      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
    setIsSaving(false)
  }

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      const defaultSettings: SystemSettings = {
        responseSpeed: 75,
        memoryRetention: 80,
        learningRate: 60,
        confidenceThreshold: 70,
        maxConversationHistory: 100,
        enableMathMode: true,
        enableMemoryLearning: true,
        enablePerformanceLogging: true,
        defaultLanguage: "english",
        responseStyle: "balanced",
        debugMode: false,
        autoSave: true,
        enableContinuousLearning: true,
        apiFallback: true,
      }
      setSettings(defaultSettings)
      setHasChanges(true)
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "zacai-settings.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
          setHasChanges(true)
        } catch (error) {
          alert("Invalid settings file")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">⚙️ System Settings</h2>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-50">
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Performance Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Response Speed: {settings.responseSpeed}%</Label>
            <Slider
              value={[settings.responseSpeed]}
              onValueChange={(value) => updateSetting("responseSpeed", value[0])}
              max={100}
              step={5}
            />
            <p className="text-sm text-gray-500">Higher values = faster responses, lower accuracy</p>
          </div>

          <div className="space-y-2">
            <Label>Memory Retention: {settings.memoryRetention}%</Label>
            <Slider
              value={[settings.memoryRetention]}
              onValueChange={(value) => updateSetting("memoryRetention", value[0])}
              max={100}
              step={5}
            />
            <p className="text-sm text-gray-500">How long to keep conversation memories</p>
          </div>

          <div className="space-y-2">
            <Label>Learning Rate: {settings.learningRate}%</Label>
            <Slider
              value={[settings.learningRate]}
              onValueChange={(value) => updateSetting("learningRate", value[0])}
              max={100}
              step={5}
            />
            <p className="text-sm text-gray-500">How quickly the AI adapts to new information</p>
          </div>

          <div className="space-y-2">
            <Label>Confidence Threshold: {settings.confidenceThreshold}%</Label>
            <Slider
              value={[settings.confidenceThreshold]}
              onValueChange={(value) => updateSetting("confidenceThreshold", value[0])}
              max={100}
              step={5}
            />
            <p className="text-sm text-gray-500">Minimum confidence required for responses</p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Feature Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Math Mode</Label>
              <p className="text-sm text-gray-500">Enable advanced mathematical calculations</p>
            </div>
            <Switch
              checked={settings.enableMathMode}
              onCheckedChange={(checked) => updateSetting("enableMathMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Memory Learning</Label>
              <p className="text-sm text-gray-500">Allow AI to learn and remember user information</p>
            </div>
            <Switch
              checked={settings.enableMemoryLearning}
              onCheckedChange={(checked) => updateSetting("enableMemoryLearning", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Performance Logging</Label>
              <p className="text-sm text-gray-500">Track system performance metrics</p>
            </div>
            <Switch
              checked={settings.enablePerformanceLogging}
              onCheckedChange={(checked) => updateSetting("enablePerformanceLogging", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Continuous Learning</Label>
              <p className="text-sm text-gray-500">Allow the AI to learn from new conversations.</p>
            </div>
            <Switch
              id="learning-mode"
              checked={settings.enableContinuousLearning}
              onCheckedChange={(checked) => updateSetting("enableContinuousLearning", checked)}
              defaultChecked
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>API Fallback</Label>
              <p className="text-sm text-gray-500">Use external APIs if internal knowledge is insufficient.</p>
            </div>
            <Switch
              id="api-fallback"
              checked={settings.apiFallback}
              onCheckedChange={(checked) => updateSetting("apiFallback", checked)}
              defaultChecked
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Debug Mode</Label>
              <p className="text-sm text-gray-500">Show detailed logs and reasoning in the console.</p>
            </div>
            <Switch
              id="debug-mode"
              checked={settings.debugMode}
              onCheckedChange={(checked) => updateSetting("debugMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Save</Label>
              <p className="text-sm text-gray-500">Automatically save conversations</p>
            </div>
            <Switch checked={settings.autoSave} onCheckedChange={(checked) => updateSetting("autoSave", checked)} />
          </div>
        </CardContent>
      </Card>

      {/* Language & Style Settings */}
      <Card>
        <CardHeader>
          <CardTitle>🗣️ Language & Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Language</Label>
            <Select value={settings.defaultLanguage} onValueChange={(value) => updateSetting("defaultLanguage", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Response Style</Label>
            <Select value={settings.responseStyle} onValueChange={(value) => updateSetting("responseStyle", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max Conversation History</Label>
            <Input
              type="number"
              value={settings.maxConversationHistory}
              onChange={(e) => updateSetting("maxConversationHistory", Number.parseInt(e.target.value) || 100)}
              min={10}
              max={1000}
            />
            <p className="text-sm text-gray-500">Number of messages to keep in memory</p>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle>💾 Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={exportSettings} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                style={{ display: "none" }}
                id="import-settings"
              />
              <Button onClick={() => document.getElementById("import-settings")?.click()} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Settings
              </Button>
            </div>
            <Button onClick={resetToDefaults} variant="destructive">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
