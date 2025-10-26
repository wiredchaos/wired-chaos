#!/usr/bin/env node
/**
 * Atlas Phase A bootstrapper for the Red Light District workspace.
 *
 * Creates the folder structure, prompt packs, metadata, and API harness
 * expected by the atlas_redlight_main.atx notebook.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

function parseArgs(argv) {
  const options = {
    project: "red-light-district",
    force: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--project":
        options.project = argv[++i] || options.project;
        break;
      case "--force":
        options.force = true;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        console.warn(`[WARN] Unknown argument: ${arg}`);
    }
  }

  return options;
}

function ensureDirectory(target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
}

function ensureFile(target, contents, force) {
  if (fs.existsSync(target) && !force) {
    return false;
  }
  ensureDirectory(path.dirname(target));
  fs.writeFileSync(target, contents, "utf8");
  return true;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/atlas/setup-phase-a.js [--project name] [--force]\n");
    console.log("  --project <name>  Target bundle (default: red-light-district)");
    console.log("  --force           Overwrite files if they already exist");
    return;
  }

  const projectRoot = path.join(ROOT, "atlas", options.project);
  const created = [];

  const templates = getTemplates(options.project);
  for (const [relativePath, contents] of Object.entries(templates)) {
    const target = path.join(ROOT, relativePath);
    const ok = ensureFile(target, contents, options.force);
    if (ok) {
      created.push(relativePath);
    }
  }

  if (created.length === 0) {
    console.log("All Atlas assets already exist. Use --force to overwrite.");
  } else {
    console.log("Created/updated Atlas assets:\n" + created.map((item) => ` - ${item}`).join("\n"));
  }
}

function getTemplates(project) {
  const base = `atlas/${project}`;
  return {
    "atlas/README.md": `# Atlas Workspace Assets\n\nThis directory contains curated assets for running the WIRED CHAOS worldbuilding and\nARG pipelines inside OpenAI Atlas.\n\n## Structure\n\n- \`${project}/\` – Atlas-ready bundle for the motherboard city's Red Light District hub.\n  - \`renders/octane/\` – Prompt packs used to generate cinematic stills.\n  - \`metadata/grok/\` – Structured metadata payloads (GROK schema compliant).\n  - \`api/cipher/\` – REST scaffolds and request collections for the cipher core.\n  - \`schema/mongo/\` – Data model references for the Lore Registry integrations.\n\nEach bundle ships with a primary \`.atx\` notebook that links all resources together.\n`,
    [`${base}/atlas_redlight_main.atx`]: `# Atlas Notebook · WIRED CHAOS · Red Light District Phase A\n\n## 🔧 Workspace Bootstrap\n- Project slug: \`wiredchaos/${project}\`\n- Folder map mirrors this notebook:\n  - \`/renders/octane/phase-a-prompts.json\`\n  - \`/metadata/grok/phase-a-metadata.json\`\n  - \`/api/cipher/cipher-core.http\`\n  - \`/schema/mongo/lore-registry.schema.json\`\n\nUse the **Run Script → \`scripts/atlas/setup-phase-a.js\`** cell to regenerate scaffolding when\nnew teammates join.\n\n\`\`\`atlas\n!node ../../scripts/atlas/setup-phase-a.js --project ${project}\n\`\`\`\n\n---\n\n## 🎥 Octane Prompt Stack\nLoad \`renders/octane/phase-a-prompts.json\` into the Asset Builder. Each entry\nincludes:\n- Camera angle signature (establishing / detail / proof terminal / cipher wall)\n- Atmosphere + lighting cues aligned with motherboard city lore\n- Render watermark directives (\`metadata.watermark\`)\n\n---\n\n## 🧬 GROK Metadata Registry\n\`metadata/grok/phase-a-metadata.json\` maps each render to:\n- Memory fragment ID (XRPL-compatible UUID)\n- Lore registry cross-links (\`lore.registrySlug\`)\n- Storage target (Atlas Drive → R2 mirror)\n\nAttach the metadata file next to rendered assets to keep the provenance chain intact.\n\n---\n\n## 🔐 Cipher Core API Harness\nUse \`api/cipher/cipher-core.http\` in the Atlas API Playground to validate endpoints:\n- \`POST /fragments/trade\`\n- \`POST /cipher/decode\`\n- \`GET /glyphs/holographic\`\n\nRequests ship with synthetic payloads and expected signatures. Update the \`X-WIRED-TRACE\`\nheader to bind runs to Atlas contexts.\n\n---\n\n## 🗄️ Lore Registry Schema Reference\nImport \`schema/mongo/lore-registry.schema.json\` into the Atlas DataFrame inspector to mirror\nMongo collections locally. The schema provides validation rules for memory fragments and\nasset linkage nodes.\n\n---\n\n## ✅ Next Steps\n1. Render the four cinematic angles via Octane using the provided prompts.\n2. Store outputs alongside the metadata JSON to register the fragments.\n3. Exercise cipher endpoints with the provided HTTP harness and capture logs in Atlas.\n4. Sync XRPL memory fragments back into the motherboard city map for live previews.\n`,
    [`${base}/renders/octane/phase-a-prompts.json`]: JSON.stringify(getPromptPack(), null, 2) + "\n",
    [`${base}/metadata/grok/phase-a-metadata.json`]: JSON.stringify(getMetadataPack(), null, 2) + "\n",
    [`${base}/api/cipher/cipher-core.http`]: getHttpCollection() + "\n",
    [`${base}/schema/mongo/lore-registry.schema.json`]: JSON.stringify(getSchema(), null, 2) + "\n",
  };
}

function getPromptPack() {
  return [
    {
      id: "establishing-neon-parallax",
      camera: {
        angle: "establishing",
        focalLength: 24,
        heightMeters: 18,
        movement: "slow dolly-in",
      },
      prompt:
        "Octane render of WIRED CHAOS motherboard city · red light district skyline · rainy midnight · neon katakana billboards · holo-rickshaw traffic · volumetric fog · cinematic contrast · anamorphic lens flares",
      metadata: {
        watermark: "WIRED CHAOS ∴ RLD",
        loreFragment: "RLD-AXON-01",
        notes: "Use as the hero wide shot introducing the district.",
      },
    },
    {
      id: "detail-holo-graffiti",
      camera: {
        angle: "detail",
        focalLength: 65,
        heightMeters: 1.7,
        movement: "handheld micro-pan",
      },
      prompt:
        "Octane render macro shot · cyberpunk alley · bioluminescent graffiti reacting to proximity sensors · chrome rain droplets · fiber optic cables exposed · magenta + cyan rim lights",
      metadata: {
        watermark: "WIRED CHAOS MICRO",
        loreFragment: "RLD-NANOTAG-07",
        notes: "Pairs with sensory log entry about adaptive graffiti sentience.",
      },
    },
    {
      id: "proof-terminal-trade",
      camera: {
        angle: "proof-terminal",
        focalLength: 35,
        heightMeters: 1.4,
        movement: "locked off",
      },
      prompt:
        "Octane render · underground trade terminal · XRPL shard vending machine · amber emergency lighting · translucent UI overlays hovering in mid-air · tactile glass keyboard · sparks from maintenance drone",
      metadata: {
        watermark: "WIRED CHAOS XRPL",
        loreFragment: "RLD-XRPL-32",
        notes: "Used to illustrate memory fragment trading ritual.",
      },
    },
    {
      id: "cipher-wall-inspection",
      camera: {
        angle: "cipher-wall",
        focalLength: 40,
        heightMeters: 2.3,
        movement: "vertical tilt",
      },
      prompt:
        "Octane render · abandoned speakeasy vault · wall of rotating holographic glyphs · ultraviolet spill lighting · quantum cipher rings · glitch particles suspended in air · archival wires snaking into the ceiling",
      metadata: {
        watermark: "WIRED CHAOS SIGIL",
        loreFragment: "RLD-CIPHER-19",
        notes: "Reference for puzzle wall assets and cipher decryption sequence.",
      },
    },
  ];
}

function getMetadataPack() {
  return {
    $schema: "https://wired-chaos.io/schemas/grok-asset-metadata.json",
    project: "WIRED CHAOS · Red Light District",
    version: "0.1.0",
    generatedAt: "${ISO_TIMESTAMP}",
    assets: [
      {
        id: "RLD-AXON-01",
        promptRef: "renders/octane/phase-a-prompts.json#establishing-neon-parallax",
        cameraAngle: "establishing",
        atlas: {
          drivePath: "atlas://wiredchaos/red-light-district/renders/octane/axon-01.png",
          watermark: "WIRED CHAOS ∴ RLD",
          contexts: ["atlas_redlight_main.atx#octane"],
        },
        storage: {
          primary: "r2://wired-chaos/red-light-district/axon-01.png",
          backup: "s3://wired-chaos-backup/rld/axon-01.png",
        },
        lore: {
          registrySlug: "motherboard-city.red-light-district",
          memoryFragment: "xrpl://fragments/RLD-AXON-01",
          summary: "Neon skyline establishing shot anchoring the Red Light District quadrant.",
        },
      },
      {
        id: "RLD-NANOTAG-07",
        promptRef: "renders/octane/phase-a-prompts.json#detail-holo-graffiti",
        cameraAngle: "detail",
        atlas: {
          drivePath: "atlas://wiredchaos/red-light-district/renders/octane/nanotag-07.png",
          watermark: "WIRED CHAOS MICRO",
          contexts: ["atlas_redlight_main.atx#octane"],
        },
        storage: {
          primary: "r2://wired-chaos/red-light-district/nanotag-07.png",
          backup: "s3://wired-chaos-backup/rld/nanotag-07.png",
        },
        lore: {
          registrySlug: "motherboard-city.red-light-district",
          memoryFragment: "xrpl://fragments/RLD-NANOTAG-07",
          summary: "Close-up evidence of adaptive graffiti reacting to passerby bio-signatures.",
        },
      },
      {
        id: "RLD-XRPL-32",
        promptRef: "renders/octane/phase-a-prompts.json#proof-terminal-trade",
        cameraAngle: "proof-terminal",
        atlas: {
          drivePath: "atlas://wiredchaos/red-light-district/renders/octane/xrpl-32.png",
          watermark: "WIRED CHAOS XRPL",
          contexts: ["atlas_redlight_main.atx#cipher"],
        },
        storage: {
          primary: "r2://wired-chaos/red-light-district/xrpl-32.png",
          backup: "s3://wired-chaos-backup/rld/xrpl-32.png",
        },
        lore: {
          registrySlug: "motherboard-city.red-light-district",
          memoryFragment: "xrpl://fragments/RLD-XRPL-32",
          summary: "Terminal node used for sanctioned memory fragment trades within the district.",
        },
      },
      {
        id: "RLD-CIPHER-19",
        promptRef: "renders/octane/phase-a-prompts.json#cipher-wall-inspection",
        cameraAngle: "cipher-wall",
        atlas: {
          drivePath: "atlas://wiredchaos/red-light-district/renders/octane/cipher-19.png",
          watermark: "WIRED CHAOS SIGIL",
          contexts: ["atlas_redlight_main.atx#cipher"],
        },
        storage: {
          primary: "r2://wired-chaos/red-light-district/cipher-19.png",
          backup: "s3://wired-chaos-backup/rld/cipher-19.png",
        },
        lore: {
          registrySlug: "motherboard-city.red-light-district",
          memoryFragment: "xrpl://fragments/RLD-CIPHER-19",
          summary: "Glyph wall containing the rotating passphrases that guard the speakeasy vault.",
        },
      },
    ],
  };
}

function getSchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://wired-chaos.io/schemas/lore-registry.schema.json",
    title: "WIRED CHAOS Lore Registry · Red Light District",
    type: "object",
    required: ["_id", "fragmentId", "district", "media", "links"],
    properties: {
      _id: {
        description: "Mongo ObjectId",
        bsonType: "objectId",
      },
      fragmentId: {
        type: "string",
        pattern: "^RLD-[A-Z]+-[0-9]{2}$",
        description: "XRPL-compatible fragment identifier",
      },
      district: {
        type: "string",
        const: "red-light",
      },
      title: {
        type: "string",
        description: "Human readable fragment headline",
      },
      summary: {
        type: "string",
        description: "Lore synopsis for in-universe memory logs",
      },
      media: {
        type: "object",
        required: ["promptRef", "atlasDrivePath", "storage"],
        properties: {
          promptRef: { type: "string" },
          atlasDrivePath: { type: "string" },
          watermark: { type: "string" },
          storage: {
            type: "object",
            required: ["primary", "backup"],
            properties: {
              primary: { type: "string", format: "uri" },
              backup: { type: "string", format: "uri" },
            },
          },
        },
      },
      links: {
        type: "object",
        required: ["xrpl", "atlasContext", "relatedFragments"],
        properties: {
          xrpl: { type: "string", format: "uri" },
          atlasContext: { type: "string" },
          relatedFragments: {
            type: "array",
            items: { type: "string", pattern: "^RLD-[A-Z]+-[0-9]{2}$" },
          },
        },
      },
      telemetry: {
        type: "object",
        properties: {
          renderedAt: { type: "string", format: "date-time" },
          ingestedAt: { type: "string", format: "date-time" },
          latencyMs: { type: "integer", minimum: 0 },
        },
      },
      tags: {
        type: "array",
        items: { type: "string" },
        default: [],
      },
    },
  };
}

function getHttpCollection() {
  return `### POST /fragments/trade\nPOST https://api.wired-chaos.dev/fragments/trade\nContent-Type: application/json\nX-WIRED-TRACE: atlas::red-light-district::{{context_id}}\nAuthorization: Bearer {{access_token}}\n\n{\n  "fragmentId": "RLD-XRPL-32",\n  "counterparty": "swarm://node/rld-trader-09",\n  "proof": {\n    "signature": "demo-signature",\n    "nonce": "{{timestamp}}"\n  },\n  "metadata": {\n    "atlasContext": "atlas_redlight_main.atx",\n    "notes": "Phase A trade validation run"\n  }\n}\n\n### POST /cipher/decode\nPOST https://api.wired-chaos.dev/cipher/decode\nContent-Type: application/json\nX-WIRED-TRACE: atlas::red-light-district::{{context_id}}\nAuthorization: Bearer {{access_token}}\n\n{\n  "glyph": "RLD-CIPHER-19",\n  "payload": "dGVzdC1wYXlsb2Fk",\n  "options": {\n    "algorithm": "quantum-holo",\n    "expectedShard": "xrpl://fragments/RLD-CIPHER-19"\n  }\n}\n\n### GET /glyphs/holographic\nGET https://api.wired-chaos.dev/glyphs/holographic?district=red-light&limit=5\nAccept: application/json\nX-WIRED-TRACE: atlas::red-light-district::{{context_id}}\nAuthorization: Bearer {{access_token}}`;
}

main();
