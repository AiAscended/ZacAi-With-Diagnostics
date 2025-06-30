export class SacredGeometry {
  // Golden Ratio and related calculations
  static goldenRatio = (1 + Math.sqrt(5)) / 2

  static goldenRectangle(width: number): {
    height: number
    ratio: number
    isGolden: boolean
  } {
    const height = width / this.goldenRatio
    const ratio = width / height
    const isGolden = Math.abs(ratio - this.goldenRatio) < 0.001

    return { height, ratio, isGolden }
  }

  static goldenSpiral(iterations: number): {
    points: Array<{ x: number; y: number; radius: number }>
    totalLength: number
  } {
    const points = []
    let x = 0,
      y = 0,
      radius = 1
    let angle = 0

    for (let i = 0; i < iterations; i++) {
      points.push({ x, y, radius })

      // Move to next position
      const nextRadius = radius * this.goldenRatio
      angle += Math.PI / 2

      x += Math.cos(angle) * radius
      y += Math.sin(angle) * radius
      radius = nextRadius
    }

    const totalLength = points.reduce((sum, point) => sum + (point.radius * Math.PI) / 2, 0)

    return { points, totalLength }
  }

  // Flower of Life calculations
  static flowerOfLife(rings: number): {
    totalCircles: number
    hexagonalPattern: boolean
    sacredNumbers: number[]
  } {
    // Each ring adds 6 more circles than the previous
    let totalCircles = 1 // Center circle

    for (let ring = 1; ring <= rings; ring++) {
      totalCircles += 6 * ring
    }

    const hexagonalPattern = rings >= 2
    const sacredNumbers = [1, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72].slice(0, rings + 1)

    return { totalCircles, hexagonalPattern, sacredNumbers }
  }

  // Vesica Piscis calculations
  static vesicaPiscis(radius: number): {
    area: number
    height: number
    width: number
    ratio: number
    symbolism: string
  } {
    const height = radius * Math.sqrt(3)
    const width = radius * 2
    const area = (2 * Math.PI * radius * radius) / 3 - (radius * radius * Math.sqrt(3)) / 2
    const ratio = height / width

    return {
      area,
      height,
      width,
      ratio,
      symbolism: "Symbol of creation, consciousness, and divine feminine",
    }
  }

  // Metatron's Cube calculations
  static metatronsCube(): {
    vertices: number
    edges: number
    platonicSolids: string[]
    dimensions: number
    significance: string
  } {
    return {
      vertices: 13,
      edges: 78,
      platonicSolids: ["tetrahedron", "cube", "octahedron", "dodecahedron", "icosahedron"],
      dimensions: 2, // 2D representation of 3D concept
      significance: "Contains all five Platonic solids, represents the blueprint of creation",
    }
  }

  // Sri Yantra calculations
  static sriYantra(): {
    triangles: number
    upwardTriangles: number
    downwardTriangles: number
    intersectionPoints: number
    symbolism: string
  } {
    return {
      triangles: 9,
      upwardTriangles: 4, // Masculine/Shiva
      downwardTriangles: 5, // Feminine/Shakti
      intersectionPoints: 43,
      symbolism: "Union of masculine and feminine, creation of universe",
    }
  }

  // Mandala calculations
  static mandala(
    sections: number,
    rings: number,
  ): {
    totalElements: number
    symmetryOrder: number
    angularDivision: number
    isBalanced: boolean
  } {
    const totalElements = sections * rings
    const symmetryOrder = sections
    const angularDivision = 360 / sections
    const isBalanced = sections % 2 === 0 || sections % 3 === 0 || sections % 4 === 0

    return {
      totalElements,
      symmetryOrder,
      angularDivision,
      isBalanced,
    }
  }

  // Fibonacci in nature calculations
  static fibonacciInNature(): {
    [key: string]: {
      fibonacciNumber: number
      examples: string[]
      goldenAngle: number
    }
  } {
    const goldenAngle = 137.5 // degrees

    return {
      "3": {
        fibonacciNumber: 3,
        examples: ["Lily petals", "Iris petals", "Trillium"],
        goldenAngle,
      },
      "5": {
        fibonacciNumber: 5,
        examples: ["Apple cross-section", "Rose petals", "Buttercup"],
        goldenAngle,
      },
      "8": {
        fibonacciNumber: 8,
        examples: ["Delphiniums", "Cosmos", "Bloodroot"],
        goldenAngle,
      },
      "13": {
        fibonacciNumber: 13,
        examples: ["Ragwort", "Corn marigold", "Cineraria"],
        goldenAngle,
      },
      "21": {
        fibonacciNumber: 21,
        examples: ["Aster", "Black-eyed susan", "Chicory"],
        goldenAngle,
      },
      "34": {
        fibonacciNumber: 34,
        examples: ["Plantain", "Pyrethrum", "Sunflower spirals"],
        goldenAngle,
      },
      "55": {
        fibonacciNumber: 55,
        examples: ["Sunflower spirals", "Pinecone spirals", "Pineapple"],
        goldenAngle,
      },
      "89": {
        fibonacciNumber: 89,
        examples: ["Large sunflower spirals", "Romanesco broccoli"],
        goldenAngle,
      },
    }
  }

  // Crystal geometry calculations
  static crystalSystems(): {
    [key: string]: {
      axes: number
      angles: number[]
      symmetry: string
      examples: string[]
      energeticProperties: string
    }
  } {
    return {
      cubic: {
        axes: 3,
        angles: [90, 90, 90],
        symmetry: "Highest symmetry",
        examples: ["Diamond", "Pyrite", "Fluorite"],
        energeticProperties: "Grounding, stability, manifestation",
      },
      tetragonal: {
        axes: 3,
        angles: [90, 90, 90],
        symmetry: "4-fold rotational",
        examples: ["Zircon", "Rutile", "Cassiterite"],
        energeticProperties: "Focus, clarity, direction",
      },
      orthorhombic: {
        axes: 3,
        angles: [90, 90, 90],
        symmetry: "3 perpendicular axes",
        examples: ["Topaz", "Peridot", "Sulfur"],
        energeticProperties: "Balance, harmony, integration",
      },
      hexagonal: {
        axes: 4,
        angles: [90, 90, 120],
        symmetry: "6-fold rotational",
        examples: ["Quartz", "Beryl", "Apatite"],
        energeticProperties: "Communication, intuition, flow",
      },
      trigonal: {
        axes: 3,
        angles: [90, 90, 120],
        symmetry: "3-fold rotational",
        examples: ["Calcite", "Tourmaline", "Corundum"],
        energeticProperties: "Creativity, inspiration, transformation",
      },
      monoclinic: {
        axes: 3,
        angles: [90, 90, 120],
        symmetry: "2-fold rotational",
        examples: ["Moonstone", "Azurite", "Malachite"],
        energeticProperties: "Flexibility, adaptation, emotional healing",
      },
      triclinic: {
        axes: 3,
        angles: [70, 80, 90],
        symmetry: "Lowest symmetry",
        examples: ["Labradorite", "Amazonite", "Kyanite"],
        energeticProperties: "Complexity, uniqueness, personal growth",
      },
    }
  }

  // Sacred proportions in architecture
  static architecturalProportions(): {
    [key: string]: {
      ratio: number
      description: string
      examples: string[]
      harmonicResonance: string
    }
  } {
    return {
      golden: {
        ratio: this.goldenRatio,
        description: "Divine proportion found in nature and art",
        examples: ["Parthenon", "Notre Dame", "Taj Mahal"],
        harmonicResonance: "Perfect harmony and beauty",
      },
      silver: {
        ratio: 1 + Math.sqrt(2),
        description: "Silver ratio, related to octagon",
        examples: ["Islamic architecture", "Japanese temples"],
        harmonicResonance: "Stability and growth",
      },
      root2: {
        ratio: Math.sqrt(2),
        description: "Square root of 2, diagonal of square",
        examples: ["Paper sizes (A4, A3)", "Gothic cathedrals"],
        harmonicResonance: "Dynamic balance",
      },
      root3: {
        ratio: Math.sqrt(3),
        description: "Square root of 3, height of equilateral triangle",
        examples: ["Hexagonal structures", "Geodesic domes"],
        harmonicResonance: "Triangular stability",
      },
      root5: {
        ratio: Math.sqrt(5),
        description: "Square root of 5, related to pentagon",
        examples: ["Pentagon building", "Rose windows"],
        harmonicResonance: "Pentagonal perfection",
      },
    }
  }

  // Calculate sacred angles
  static sacredAngles(): {
    [key: string]: {
      degrees: number
      radians: number
      significance: string
      applications: string[]
    }
  } {
    return {
      goldenAngle: {
        degrees: 137.507764,
        radians: 2.399963,
        significance: "Optimal angle for plant growth and spiral arrangements",
        applications: ["Sunflower seeds", "Pine cone spirals", "Nautilus shell"],
      },
      pentagonAngle: {
        degrees: 72,
        radians: (Math.PI * 2) / 5,
        significance: "Interior angle of regular pentagon",
        applications: ["Pentagon building", "Five-pointed star", "Rose petals"],
      },
      hexagonAngle: {
        degrees: 60,
        radians: Math.PI / 3,
        significance: "Interior angle of equilateral triangle",
        applications: ["Honeycomb", "Benzene ring", "Crystal structures"],
      },
      octagonAngle: {
        degrees: 45,
        radians: Math.PI / 4,
        significance: "45-degree angle, perfect balance",
        applications: ["Stop signs", "Bagua symbol", "Islamic patterns"],
      },
      vesicaAngle: {
        degrees: 60,
        radians: Math.PI / 3,
        significance: "Angle in vesica piscis intersection",
        applications: ["Christian fish symbol", "Flower of Life", "Sacred geometry"],
      },
    }
  }
}
