# ZacAI - Enhanced AI Assistant

## Overview

ZacAI is a modular AI assistant designed to provide intelligent responses and perform various tasks using specialized modules. This project is built with Next.js, TypeScript, and Shadcn UI components.

## Features

- **Modular Design**: Easily extendable with new modules for different functionalities.
- **Enhanced Vocabulary**: Utilizes a comprehensive vocabulary for accurate definitions and language understanding.
- **Tesla Mathematics**: Capable of performing Tesla/Vortex math calculations.
- **User Memory**: Remembers user preferences and personal information for personalized interactions.
- **Admin Dashboard**: Provides a user interface for managing knowledge, monitoring performance, and configuring system settings.

## Technologies Used

- Next.js
- TypeScript
- Shadcn UI
- Lucide React Icons

## Getting Started

1.  Clone the repository:

    \`\`\`bash
    git clone https://github.com/your-username/ZacAI-With-Diagnostics.git
    \`\`\`

2.  Install dependencies:

    \`\`\`bash
    npm install
    \`\`\`

3.  Run the development server:

    \`\`\`bash
    npm run dev
    \`\`\`

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## File Structure

\`\`\`
ZacAI-With-Diagnostics/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard page
│   ├── api/
│   │   └── ...
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Main layout component
│   └── page.tsx              # Main application page
├── components/
│   ├── admin-dashboard-clean.tsx # Clean admin dashboard
│   ├── admin-dashboard-v2.tsx  # Version 2 of admin dashboard
│   ├── enhanced-ai-chat.tsx    # Enhanced AI chat component
│   ├── error-boundary.tsx      # Error boundary component
│   ├── knowledge-management-tab.tsx # Knowledge management tab
│   ├── memory-system-tab.tsx   # Memory system tab
│   ├── performance-monitor-tab.tsx # Performance monitor tab
│   ├── performance-monitor.tsx # Performance monitor component
│   ├── system-settings-tab.tsx # System settings tab
│   ├── theme-provider.tsx      # Theme provider component
│   └── ui/                   # Shadcn UI components
├── config/
│   └── app.ts                # Application configuration
├── core/
│   ├── api/
│   │   └── manager.ts        # API manager
│   ├── context/
│   │   └── manager.ts        # Context manager
│   ├── memory/
│   │   └── user-memory.ts    # User memory management
│   ├── storage/
│   │   └── manager.ts        # Storage manager
│   └── system/
│       └── manager.ts        # System manager
├── engines/
│   ├── cognitive/
│   │   └── index.ts          # Cognitive engine
│   ├── learning/
│   │   └── index.ts          # Learning engine
│   └── reasoning/
│       └── index.ts          # Reasoning engine
├── hooks/
│   └── use-mobile.tsx        # Mobile detection hook
├── lib/
│   └── utils.ts              # Utility functions
├── modules/
│   ├── coding/
│   │   └── ...
│   ├── facts/
│   │   └── ...
│   ├── mathematics/
│   │   └── ...
│   ├── philosophy/
│   │   └── ...
│   └── vocabulary/
│       └── ...
├── public/
│   ├── learnt_coding.json    # Learned coding data
│   ├── learnt_maths.json     # Learned mathematics data
│   ├── learnt_science.json   # Learned science data
│   ├── learnt_vocab.json     # Learned vocabulary data
│   ├── seed_coding.json      # Seed coding data
│   ├── seed_knowledge.json   # Seed knowledge data
│   ├── seed_learning.json    # Seed learning data
│   ├── seed_maths.json       # Seed mathematics data
│   ├── seed_system.json      # Seed system data
│   └── seed_vocab.json       # Seed vocabulary data
├── scripts/
│   └── dictionary-scraper.js # Dictionary scraper script
├── seed/
│   ├── coding.json           # Seed coding data
│   ├── facts.json            # Seed facts data
│   ├── mathematics.json      # Seed mathematics data
│   └── philosophy.json        # Seed philosophy data
├── styles/
│   └── globals.css           # Global CSS styles
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── types/
    ├── engines.ts            # Engine types
    ├── global.ts             # Global types
    └── modules.ts            # Module types
