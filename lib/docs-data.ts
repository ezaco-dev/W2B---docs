export interface DocSection {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  codeSnippet?: string;
  parameters?: { name: string; type: string; description: string; required: boolean }[];
  decorators?: { name: string; description: string; example: string }[];
}

export const DOCS_SECTIONS: DocSection[] = [
  {
    id: "overview",
    title: "Overview & Architecture",
    category: "Introduction",
    description: "Learn about W2B, its declarative design philosophy, and how it wraps Baileys into a modular bot-routing framework.",
    content: `**W2B** is an elegant, declarative wrapper built on top of **@whiskeysockets/baileys**. It is designed to remove the complex boilerplate code commonly required when writing WhatsApp bots.

With traditional Baileys, developers must manually listen for raw connection updates, parse incoming messages, extract JIDs, handle mime-types, and handle state persistence. **W2B** replaces this imperative complexity with an intuitive model of **Routes**, **Actions**, and **Placeholders**, backed by full chaining decorators for permission controls.

### Key Architecture Benefits

*   **Declarative Syntax**: Focus on *what* the bot should do, not *how* to parse socket streams.
*   **Built-in Hot Reload (Ctrl+R)**: Re-run your bot code instantly without killing your active socket session, saving development time.
*   **Media Pipeline**: Automatically downloads and maps media types (images, videos, documents, audio) so you can pipe them directly to actions.
*   **Chained Security Filters**: Restrict command permissions natively with methods like \`.OwnerOnly()\`, \`.AdminOnly()\`, or \`.GrubOnly()\`.
*   **Flexible Authentication**: Connect using standard high-contrast terminal QR codes or 8-digit secure Pairing Codes.
`,
    codeSnippet: `// Standard W2B declarative layout
import { Setup, Route, Run, Text } from 'w2b';

Setup({
  Owner: '628123456789'
});

Route('/ping', () => Text('Pong! 🏓'));

Run({ SessionName: 'Main_Session' });`
  },
  {
    id: "getting-started",
    title: "Getting Started",
    category: "Installation",
    description: "Install W2B via NPM, set up your configuration, and run your very first Echo Bot in under two minutes.",
    content: `Getting started with **W2B** is straightforward. You only need an NPM environment and a mobile device with WhatsApp to scan the QR code or accept the pairing code.

### Prerequisites
*   Node.js v16 or higher
*   An active WhatsApp account to link as the bot

### 1. Installation
Install the core package along with Baileys and its peer dependencies:

\`\`\`bash
npm install w2b @whiskeysockets/baileys
\`\`\`

### 2. Create Your Script
Create an \`index.js\` file in your project directory and add the following code to implement a robust, responsive greeting bot:
`,
    codeSnippet: `import { Setup, Route, Run, Text, Arg, GetUsrId, Mention } from 'w2b';

// 1. Initial Configuration
Setup({
  Owner: '628571234567', // Replace with your phone number (with country code)
  SessionName: 'W2B_Demo'
});

// 2. Exact Match Route
Route('/ping', () => Text('Pong! 🏓'));

// 3. Dynamic Greeting using Placeholders
Route('/hello', () => {
  const userId = GetUsrId();
  return Text(\`Hello \${Mention(userId)}! Welcome to W2B! 👋\`);
});

// 4. Echo Route using Argument extractors
Route('/echo', () => {
  const messageBody = Arg(1, Infinity); // Grabs everything from word 1 onwards
  if (!messageBody) return Text('Please provide some text! Usage: /echo <your-message>');
  return Text(\`Echo: \${messageBody}\`);
});

// 5. Initialize the bot
Run({
  Pairing: false, // Set to true to link using a phone number + 8-digit code
  Qrcode: true    // Display QR in terminal
});`
  },
  {
    id: "routing",
    title: "Declarative Routing",
    category: "Core Routing",
    description: "Understand how Route and Include match incoming text streams and execute handlers with clean pattern matching.",
    content: `Routing is the heartbeat of **W2B**. Instead of nested \`if/else\` or \`switch\` blocks checking \`msg.body\`, W2B registers routes dynamically and matches them against incoming text.

### Trigger Matches (\`Route\`)
The \`Route(pattern, handler)\` function matches the first word (the command word) of incoming messages.

*   **Exact match**: \`Route('/help', ...)\` matches messages starting with exactly \`/help\`.
*   **Aliases / Comma separation**: You can easily define multiple aliases for a single route by separating them with commas. For example, \`Route('hi,hello,halo', ...)\` matches if the user types any of those three words.
*   **Case Insensitivity**: Commands are converted to lowercase internally during matching, ensuring users don't break the bot with caps.

### Inclusion Matching (\`Include\`)
Sometimes you want to trigger responses if a message contains a keyword anywhere inside the body, rather than just matching the first word. That's where \`Include(keywords, handler)\` comes in.

*   **Inclusion matching**: \`Include('help,support', ...)\` will fire if the word "help" or "support" is written anywhere in the message body.
*   **Keyword streams**: Like routes, keywords can be comma-separated.
`,
    codeSnippet: `import { Route, Include, Text } from 'w2b';

// Match command triggers
Route('/rules', () => Text('1. Be nice. 2. No spam.'));
Route('/help,info,menu', () => Text('Available commands: /ping, /rules, /echo'));

// Match content inclusions anywhere in message
Include('scam,link,crypto', () => Text('⚠️ Please refrain from sending suspicious links or promotional text.'));`
  },
  {
    id: "actions",
    title: "Executable Actions",
    category: "Response Actions",
    description: "Explore the full suite of Actions including Text, Image, Video, Audio, Polls, and structural commands like Delete and Ban.",
    content: `Actions are simple declarative commands that define how the bot should reply. Handlers return actions, which the engine then resolves, formats, downloads, and executes.

W2B supports multiple media types, native polls, location pins, and administrative functions. You can return a **single action**, an **array of actions** (to send multiple sequential messages), or **nest arrays** (which are automatically flattened).

### Parameter Specifications
Below is a list of all available actions, their parameters, and expected behaviors.
`,
    parameters: [
      { name: "Text(text)", type: "Action", description: "Sends a text message with automatic placeholder evaluation and JID mentions.", required: true },
      { name: "Image(urlOrPath, caption?)", type: "Action", description: "Sends an image from an HTTP URL or local filesystem path. Supports an optional caption.", required: true },
      { name: "Video(urlOrPath, caption?)", type: "Action", description: "Sends a video. Supports caching and automatic content type mapping.", required: true },
      { name: "Document(urlOrPath, caption?, filename?)", type: "Action", description: "Sends any file attachment as a document, resolving the MIME-type automatically.", required: true },
      { name: "Audio(urlOrPath, ptt?)", type: "Action", description: "Sends audio. If ptt is true, sends as a WhatsApp Push-To-Talk voice note.", required: true },
      { name: "Sticker(urlOrPath)", type: "Action", description: "Sends a custom static or animated sticker. (Alias: Sticer).", required: true },
      { name: "Poll(question, options)", type: "Action", description: "Sends an interactive poll. Options is an array of strings. Multi-choice is supported natively.", required: true },
      { name: "Location(lat, lng, name?, address?)", type: "Action", description: "Sends a location pin with custom coordinates, metadata name, and descriptive address text.", required: true },
      { name: "Delete()", type: "Action", description: "Deletes the incoming message that triggered the command.", required: true },
      { name: "Ban(userId)", type: "Action", description: "Removes the user from the WhatsApp group. Can be chained with GetUsrId().", required: true }
    ],
    codeSnippet: `import { Route, Text, Image, Poll, Location, Delete } from 'w2b';

// Sending media easily
Route('/logo', () => Image('https://picsum.photos/seed/w2b/400/400', 'Here is our official logo!'));

// Native interactive poll
Route('/vote', () => Poll('Which action is coolest?', ['Text', 'Sticker', 'Native Polls']));

// Map pinning
Route('/office', () => Location(-6.2088, 106.8456, 'W2B Headquarters', 'Jakarta, Indonesia'));

// Multi-message actions
Route('/double', () => [
  Text('Sending first message...'),
  Text('Sending second message!')
]);`
  },
  {
    id: "placeholders",
    title: "Dynamic Placeholders",
    category: "Placeholders",
    description: "Leverage context-aware placeholders to parse custom user arguments, extract media, and tag specific JIDs.",
    content: `Placeholders allow you to query information about the active message and user during execution. Because handlers are declarative, placeholders evaluate lazily when the action is being processed.

### Dynamic Message Arguments (\`Arg\`)
The \`Arg(index, endIndex?)\` placeholder is critical for retrieving text arguments from commands.
*   \`Arg(0)\`: Always evaluates to the command word itself (e.g. \`"/echo"\`).
*   \`Arg(1)\`: Returns the first parameter after the command.
*   \`Arg(1, 4)\`: Joins parameters from index 1 to 4 with standard spacing.
*   \`Arg(1, Infinity)\` or \`Arg(1)\` (without an upper limit in helper methods): Grabs all arguments from index 1 to the end of the text.

### User References & Mentions
*   **\`GetUsrId()\`**: Retrieves the WhatsApp JID of the sender (e.g. \`"628123456789@s.whatsapp.net"\`). Perfect for passing to \`Ban()\` or logging.
*   **\`Mention(userId)\`**: Generates a standard mention token. When placed inside a \`Text\` action, it formats correctly as a highlighted text link and sends the matching JID in WhatsApp's internal mention list.

### Media Extraction (\`GetMedia\`)
The \`GetMedia()\` placeholder captures media attachments from incoming messages (such as an image a user sent). You can pass it directly into downstream media actions. This makes operations like "Image to Sticker" incredibly easy to write!
`,
    codeSnippet: `import { Route, Text, Sticker, GetMedia, GetUsrId, Mention, Arg } from 'w2b';

// Convert any incoming image to a sticker
Route('/sticker', () => {
  // GetMedia() detects incoming media and downloads it to a temp folder,
  // which is auto-cleaned after the action resolves!
  return Sticker(GetMedia());
});

// Mention users dynamically
Route('/whoami', () => {
  return Text(\`You are: \${Mention(GetUsrId())} (ID: \${GetUsrId()})\`);
});

// Calculate math dynamically
Route('/add', () => {
  const num1 = parseFloat(Arg(1));
  const num2 = parseFloat(Arg(2));
  if (isNaN(num1) || isNaN(num2)) {
    return Text('Error! Please provide two numbers. Example: /add 10 20');
  }
  return Text(\`Result: \${num1 + num2}\`);
});`
  },
  {
    id: "decorators",
    title: "Advanced Decorators",
    category: "Security & Guards",
    description: "Guard your bot's routes with chainable decorators to restrict actions to Admins, Owners, or Group chats.",
    content: `Security is crucial when deploying WhatsApp bots. You don't want regular group members trigger administrative actions like restarting the bot, deleting messages, or banning participants.

W2B resolves this elegantly by exposing **chainable decorators** on the route objects returned by \`Route(...)\`. These guards are evaluated *before* the handler executes, preventing unauthorized compute or state changes.

### Available Decorators
`,
    decorators: [
      { name: ".OwnerOnly()", description: "Restricts command execution strictly to the WhatsApp numbers defined in Setup().", example: "Route('/reload', () => Reload()).OwnerOnly();" },
      { name: ".GrubOnly()", description: "Forces the command to only execute inside WhatsApp Groups (@g.us). Ignored in private chats.", example: "Route('/warn', () => Text('Follow rules!')).GrubOnly();" },
      { name: ".PrivateOnly()", description: "Restricts command execution strictly to Private messages. Ignored inside group chats.", example: "Route('/register', () => Text('Registering...')).PrivateOnly();" },
      { name: ".AdminOnly()", description: "Requires the message sender to be a Group Admin or Superadmin. Only applicable in Groups.", example: "Route('/kick', () => Ban(GetUsrId())).GrubOnly().AdminOnly();" }
    ],
    codeSnippet: `import { Route, Text, Ban, GetUsrId, Reload } from 'w2b';

// 1. Group Admins Only command
Route('/kickme', () => Ban(GetUsrId()))
  .GrubOnly()
  .AdminOnly();

// 2. Bot Owner Only command
Route('/reboot', () => [
  Text('Performing hot reload, please stand by...'),
  Reload()
]).OwnerOnly();

// 3. Combined Private and Owner restrictions
Route('/status', () => Text('All systems operational.'))
  .PrivateOnly()
  .OwnerOnly();`
  },
  {
    id: "hot-reload",
    title: "Hot Reload & Lifecycle",
    category: "Development Flow",
    description: "Discover how hot-reloading keeps your bot active while editing code, and how to bind custom event handlers.",
    content: `One of the most frustrating aspects of WhatsApp bot development is constantly scanning QR codes or waiting for connections to re-open whenever you make a small change.

**W2B** has a built-in hot-reload mechanism that keeps your socket connection alive or instantly restarts the node process while preserving authentication cookies.

### Hot Reload in Terminal (\`Ctrl+R\`)
If your terminal is running in TTY mode, W2B intercepts the key stream.
*   **Press \`Ctrl + R\`**: Trigger a hot reload instantly.
*   **What happens behind the scenes**:
    1.  The runner detects the restart request.
    2.  The current socket is closed gracefully.
    3.  A sub-process of your entry script is spawned via \`child_process.spawn\` with the same arguments.
    4.  The current process terminates, letting the new process boot up in under 0.5 seconds!
*   No more manually terminating node, restarting, and waiting.

### Programmatic Hot Reload
You can also trigger a reload programmatically by returning the \`Reload()\` action in any handler. This is extremely useful for pulling the latest code from GitHub and rebooting the bot from WhatsApp!

### Custom Event Binding (\`Event\`)
W2B wraps Baileys events. While standard routing is declarative, you can hook into connection lifecycles or metadata changes with \`Event(name, handler)\`:
`,
    codeSnippet: `import { Route, Text, Reload, Event } from 'w2b';

// Restarting bot via chat command (restricted to Owner)
Route('/restart', () => {
  return [
    Text('Rebooting bot... ⚡'),
    Reload() // Executable Reload action
  ];
}).OwnerOnly();

// Binding a custom event for group joiners
Event('group-participants.update', async (ev, sock) => {
  const { id, participants, action } = ev; // id is the group JID, participants is an array of added/removed users
  if (action === 'add') {
    for (const participant of participants) {
      const num = participant.split('@')[0];
      await sock.sendMessage(id, { 
        text: 'Welcome @' + num + ' to our group! Please read the rules. 🎉',
        mentions: [participant]
      });
    }
  }
});`
  },
  {
    id: "object-routing",
    title: "Object-Based Routing & Setup Overrides",
    category: "Core Routing",
    description: "Learn W2B's object-oriented routing syntax with computed keys, array triggers, Include wrappers, and module-level Setup overrides.",
    content: `For larger scale applications, **W2B** supports passing a single **Mapping Object** directly into \`Route(...)\`. This allows you to define triggers, computed keys, and complex arrays of actions cleanly.
    
### 1. Object Routing Syntax
Instead of calling \`Route('/trigger', handler)\` repeatedly, you can group them into a single clean object map:
*   **Simple keys**: \`"hai": Text("halo")\` maps the exact word trigger "hai" directly to a \`Text\` action.
*   **Array values**: \`"hai2": [Image("/src/hai.png"), Text("hai lagi")]\` will execute multiple actions in sequence.
*   **Computed Array Triggers**: \`[["kontol", "memek", "tai"]]: Delete()\` allows multiple bad words to be registered dynamically under a single handler.
*   **Computed Include Wrappers**: \`[Include(["anjing", "asu"])]: Delete()\` dynamically registers inclusion detection for multiple swear words anywhere in the message body.

### 2. File-Based Sub-Commands & Local Overrides
You can separate your commands into multiple files. Sub-commands can have their own \`Setup()\` block which overrides the global settings:
*   **Precedence**: A local \`Setup({ GrubOnly: true })\` call inside a sub-command function (e.g. \`Hei()\`) is evaluated with a **higher priority** than the global \`Setup()\` configuration.
`,
    codeSnippet: `import { Setup, Route, Run, Text, Image, Delete, Include, Ban, GetUsrId, Mention, Arg } from 'w2b'
import Hei from './command/hei.js'

// Global Settings
Setup({
  Owner: "628999999999",
  GrubOnly: false
})
  
Route({
  "hai" : Text("halo"),
  "hai2" : [Image("https://picsum.photos/seed/hai/400/400"), Text("hai lagi")],
  [["kontol", "memek", "tai"]] : Delete(),
  [Include(["anjing", "asu", "bangsad"])] : Delete(),
  "say" : Arg(1, 10),
  "niga" : [
    Text(\`Member \${Mention(GetUsrId())} used a banned word!\`), 
    Ban(GetUsrId())
  ],
  "hei" : Hei() // Executes Hei sub-command with local Setup overrides
})

Run({ SessionName: "bot-pairing" })`
  }
];

export interface PresetRoute {
  name: string;
  description: string;
  code: string;
}

export const PLAYGROUND_PRESETS: PresetRoute[] = [
  {
    name: "Standard Echo & Greet Bot",
    description: "Demonstrates standard matching, argument retrieval, and user mentions.",
    code: `// Route Configuration
Route('/ping', () => Text('Pong! 🏓'));

Route('/echo', () => {
  const content = Arg(1, Infinity);
  if (!content) return Text('Usage: /echo <text>');
  return Text('Echo: ' + content);
});

Route('/hello', () => {
  return Text('Greetings ' + Mention(GetUsrId()) + '! Hope you are having an amazing day.');
});`
  },
  {
    name: "Admin Moderator Guards",
    description: "Simulates restrictive route decorators like AdminOnly and GrubOnly.",
    code: `// Admin Moderator Configuration
Route('/kick', () => {
  return [
    Text('Removing user from group...'),
    Ban(GetUsrId())
  ];
}).GrubOnly().AdminOnly();

Route('/delete', () => {
  return Delete();
}).GrubOnly().AdminOnly();

Route('/warn', () => {
  return Text('⚠️ Warning ' + Mention(GetUsrId()) + '! Swearing is not allowed here.');
}).GrubOnly();`
  },
  {
    name: "Interactive Polls & Media Pipe",
    description: "Simulates multi-message actions, native polls, and media sticker transformations.",
    code: `// Media & Interactive Config
Route('/vote', () => {
  return Poll('What is W2B designed for?', [
    'Speed & Hot Reload',
    'Declarative Actions',
    'Guards & Decorators',
    'All of the above!'
  ]);
});

Route('/sticker', () => {
  // If user sends an image, GetMedia() captures it
  // and pipes it straight into the Sticker action!
  return Sticker(GetMedia());
});

Route('/system', () => {
  return [
    Text('Contacting server... 📡'),
    Text('Running health checks... OK!'),
    Location(-6.2088, 106.8456, 'W2B Node', 'Region: Jakarta')
  ];
}).OwnerOnly();`
  },
  {
    name: "Object Routing & Local Overrides",
    description: "Demonstrates object mapping routing, computed array triggers, Include filters, and command-specific overrides.",
    code: `// Setup global permissions
Setup({ Owner: "087718761419", GrubOnly: false });

Route({
  "hai" : Text("halo"),
  "hai2" : [Image("https://picsum.photos/seed/hai2/400/300"), Text("hai lagi")],
  "foto" : Image(GetMedia(), "ini fotonya"),
  "video" : Video("https://assets.mixkit.co/videos/preview/mixkit-funny-cat-with-glasses-40200-large.mp4", "video nya lucu banget"),
  [["kontol", "memek", "tai"]] : Delete(),
  [Include(["anjing", "asu", "bangsad"])] : Delete(),
  "say" : Arg(1, 10),
  "niga" : [
    Text(\`Anggota \${Mention(GetUsrId())} mengatakan kata terlarang\`), 
    Ban(GetUsrId())
  ],
  "hei" : Hei() // Calls sub-command module with local Setup({ GrubOnly: true })
});

Run({ SessionName: "bot-pairing" });`
  }
];
