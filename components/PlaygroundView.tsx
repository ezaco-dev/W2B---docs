'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Send, 
  User, 
  Users, 
  ShieldAlert, 
  RotateCw, 
  Paperclip, 
  Check, 
  Plus, 
  Play, 
  Info,
  Trash2,
  FileImage,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { PLAYGROUND_PRESETS, PresetRoute } from '../lib/docs-data';
import { cn } from '../lib/utils';

// Static utility helpers outside component scope to comply with React 19 compiler purity standards
let globalMsgCounter = 0;
function getUniqueMsgId(): string {
  globalMsgCounter++;
  return `msg-${Date.now()}-${globalMsgCounter}-${Math.floor(Math.random() * 1000)}`;
}

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getFormattedTimeNoSeconds(): string {
  return new Date().toLocaleTimeString([], { hour12: false });
}

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  role: 'member' | 'admin' | 'owner';
  text: string;
  time: string;
  isBot: boolean;
  isSystem: boolean;
  isDeleted?: boolean;
  type?: 'text' | 'poll' | 'location' | 'image' | 'sticker' | 'ban' | 'video';
  pollQuestion?: string;
  pollOptions?: { text: string; votes: number }[];
  location?: { name: string; address: string; lat: number; lng: number };
  imageUrl?: string;
  videoUrl?: string;
  attachmentName?: string;
}

export default function PlaygroundView() {
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [simRole, setSimRole] = useState<'member' | 'admin' | 'owner'>('owner');
  const [isGroupChat, setIsGroupChat] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  
  // Media Attachment simulator state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isHotReloading, setIsHotReloading] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[W2B Engine] Initializing session "W2B_Sandbox"...`,
    `[W2B Engine] Session loaded from state (Multi-File Auth).`,
    `[W2B Engine] Hot Reload hook bound to stdin (Press Ctrl+R to restart).`,
    `[W2B Engine] Bot online! Connected as +62 899 999 999 (W2B Sandbox Bot).`
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-start',
      sender: 'system',
      senderName: 'System',
      role: 'owner',
      text: '🤖 W2B Sandbox session connected. Welcome! Use the controls above to test commands as Member, Admin, or Owner.',
      time: '12:00 PM',
      isBot: false,
      isSystem: true
    }
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const consoleContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat and terminal logs
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Log to terminal helper
  const addTerminalLog = (log: string) => {
    const timestamp = getFormattedTimeNoSeconds();
    setTerminalLogs(prev => [...prev, `[${timestamp}] ${log}`]);
  };

  // Simulates hot reload
  const handleHotReload = () => {
    if (isHotReloading) return;
    setIsHotReloading(true);
    addTerminalLog(`🔄 Triggering Hot Reload... (PID ${Math.floor(Math.random() * 8000) + 1000})`);
    
    // Add reload system message
    setMessages(prev => [
      ...prev,
      {
        id: getUniqueMsgId(),
        sender: 'system',
        senderName: 'System',
        role: 'owner',
        text: '🔄 [Hot Reload] W2B Engine restarted in 0.34s! Preserving active socket connection, clearing temp cache.',
        time: getFormattedTime(),
        isBot: false,
        isSystem: true
      }
    ]);

    setTimeout(() => {
      setIsHotReloading(false);
      addTerminalLog(`[W2B Engine] Router re-bound successfully. All routes synced.`);
    }, 800);
  };

  // Process message parsing
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const messageText = inputText.trim();
    const messageTime = getFormattedTime();
    const messageId = getUniqueMsgId();
    const senderNumber = simRole === 'owner' ? '628999999999' : simRole === 'admin' ? '628555666777' : '628111222333';
    const senderName = simRole === 'owner' ? 'Bot Owner' : simRole === 'admin' ? 'Group Admin' : 'Regular Member';

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: messageId,
      sender: senderNumber + (isGroupChat ? '@g.us' : '@s.whatsapp.net'),
      senderName,
      role: simRole,
      text: messageText,
      time: messageTime,
      isBot: false,
      isSystem: false,
      imageUrl: attachedImage || undefined,
      attachmentName: attachedImage ? 'image.jpg' : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachedImage(null); // Clear attachment

    // Log user activity
    addTerminalLog(`[Route Engine] Parsing message: "${messageText || 'Image Attachment'}" from ${senderNumber}`);

    // 2. Simulate Bot Parsing
    setTimeout(() => {
      const trimmed = messageText.trim();
      const words = trimmed.split(/\s+/);
      const command = words[0]?.toLowerCase() || '';

      let matchedCommand = '';
      let errorReason = '';
      let isMatched = false;

      // PRESET MATCHERS
      if (activePresetIndex === 0) {
        // Standard Echo & Greet Bot
        if (command === '/ping') {
          isMatched = true;
          matchedCommand = '/ping';
          executePing(messageId, messageTime);
        } else if (command === '/echo') {
          isMatched = true;
          matchedCommand = '/echo';
          const echoContent = words.slice(1).join(' ');
          executeEcho(echoContent, messageId, messageTime);
        } else if (command === '/hello') {
          isMatched = true;
          matchedCommand = '/hello';
          executeHello(senderNumber, messageId, messageTime);
        }
      } else if (activePresetIndex === 1) {
        // Admin Moderator Guards
        // Rules:
        // /kick -> GroupOnly, AdminOnly (requires 'admin' or 'owner')
        // /delete -> GroupOnly, AdminOnly
        // /warn -> GroupOnly (requires group)
        if (command === '/kick') {
          isMatched = true;
          matchedCommand = '/kick';
          if (!isGroupChat) {
            errorReason = 'GrubOnly condition failed: command must be executed in a WhatsApp Group.';
            triggerGuardFailure('/kick', errorReason, messageTime);
          } else if (simRole !== 'admin' && simRole !== 'owner') {
            errorReason = 'AdminOnly condition failed: sender is a regular participant.';
            triggerGuardFailure('/kick', errorReason, messageTime);
          } else {
            executeKick(senderNumber, senderName, messageId, messageTime);
          }
        } else if (command === '/delete') {
          isMatched = true;
          matchedCommand = '/delete';
          if (!isGroupChat) {
            errorReason = 'GrubOnly condition failed: command must be executed in a WhatsApp Group.';
            triggerGuardFailure('/delete', errorReason, messageTime);
          } else if (simRole !== 'admin' && simRole !== 'owner') {
            errorReason = 'AdminOnly condition failed: sender is a regular participant.';
            triggerGuardFailure('/delete', errorReason, messageTime);
          } else {
            executeDelete(messageId, messageTime);
          }
        } else if (command === '/warn') {
          isMatched = true;
          matchedCommand = '/warn';
          if (!isGroupChat) {
            errorReason = 'GrubOnly condition failed: command must be executed in a WhatsApp Group.';
            triggerGuardFailure('/warn', errorReason, messageTime);
          } else {
            executeWarn(senderNumber, messageId, messageTime);
          }
        }
      } else if (activePresetIndex === 2) {
        // Interactive Polls & Media Pipe
        // /vote -> Everyone
        // /sticker -> Requires image attachment. Pipes GetMedia() -> Sticker()
        // /system -> OwnerOnly (requires 'owner')
        if (command === '/vote') {
          isMatched = true;
          matchedCommand = '/vote';
          executeVote(messageId, messageTime);
        } else if (command === '/sticker') {
          isMatched = true;
          matchedCommand = '/sticker';
          const hasImage = userMsg.imageUrl !== undefined;
          executeSticker(hasImage, userMsg.imageUrl || null, messageId, messageTime);
        } else if (command === '/system') {
          isMatched = true;
          matchedCommand = '/system';
          if (simRole !== 'owner') {
            errorReason = 'OwnerOnly condition failed: current sender is not the registered owner.';
            triggerGuardFailure('/system', errorReason, messageTime);
          } else {
            executeSystem(messageId, messageTime);
          }
        }
      } else if (activePresetIndex === 3) {
        // Object Routing & Local Overrides
        const lowerMsg = trimmed.toLowerCase();

        // 1. Array Trigger Match [["kontol", "memek", "tai"]]
        const badWordsArray = ["kontol", "memek", "tai"];
        const matchesArrayWord = badWordsArray.find(w => lowerMsg === w);

        // 2. Inclusion Trigger Match [Include(["anjing", "asu", "bangsad"])]
        const inclusionWords = ["anjing", "asu", "bangsad"];
        const matchesIncludeWord = inclusionWords.find(w => lowerMsg.includes(w));

        if (matchesArrayWord) {
          isMatched = true;
          matchedCommand = `[["${matchesArrayWord}"]]`;
          addTerminalLog(`[Route Engine] Match found: Object Key [["kontol", "memek", "tai"]]`);
          addTerminalLog(`[Action Executor] Resolving action: Delete()`);
          
          // Delete user message
          setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
            addTerminalLog(`[W2B Bot] Message from @${senderNumber} successfully deleted for all participants.`);
          }, 400);

        } else if (matchesIncludeWord) {
          isMatched = true;
          matchedCommand = `[Include(["${matchesIncludeWord}"])]`;
          addTerminalLog(`[Route Engine] Match found: [Include(["anjing", "asu", "bangsad"])] containing "${matchesIncludeWord}"`);
          addTerminalLog(`[Action Executor] Resolving action: Delete()`);

          // Delete user message
          setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true } : m));
            addTerminalLog(`[W2B Bot] Message from @${senderNumber} successfully deleted for all participants.`);
          }, 400);

        } else if (command === 'hai') {
          isMatched = true;
          matchedCommand = 'hai';
          addTerminalLog(`[Route Engine] Match found: Object Key "hai"`);
          addTerminalLog(`[Action Executor] Resolving action: Text("halo")`);
          
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueMsgId(),
                sender: 'bot',
                senderName: 'W2B Bot',
                role: 'owner',
                text: 'halo',
                time: messageTime,
                isBot: true,
                isSystem: false
              }
            ]);
          }, 400);

        } else if (command === 'hai2') {
          isMatched = true;
          matchedCommand = 'hai2';
          addTerminalLog(`[Route Engine] Match found: Object Key "hai2"`);
          addTerminalLog(`[Action Executor] Resolving sequential actions: [Image, Text]`);

          setTimeout(() => {
            addTerminalLog(`[Action Executor] Sending action 1/2: Image("https://picsum.photos/seed/hai2/400/300")`);
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueMsgId(),
                sender: 'bot',
                senderName: 'W2B Bot',
                role: 'owner',
                text: 'hai lagi',
                time: messageTime,
                isBot: true,
                isSystem: false,
                imageUrl: 'https://picsum.photos/seed/hai2/400/300'
              }
            ]);
          }, 400);

        } else if (command === 'foto') {
          isMatched = true;
          matchedCommand = 'foto';
          addTerminalLog(`[Route Engine] Match found: Object Key "foto"`);
          
          const hasImage = userMsg.imageUrl !== undefined;
          if (hasImage) {
            addTerminalLog(`[Placeholders] GetMedia() captured user's attached photo successfully.`);
            addTerminalLog(`[Action Executor] Resolving action: Image(GetMedia(), "ini fotonya")`);
          } else {
            addTerminalLog(`[Placeholders] GetMedia() warning: No media attachment provided by user. Falling back to default seed image.`);
            addTerminalLog(`[Action Executor] Resolving action: Image(Fallback, "ini fotonya")`);
          }

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueMsgId(),
                sender: 'bot',
                senderName: 'W2B Bot',
                role: 'owner',
                text: 'ini fotonya',
                time: messageTime,
                isBot: true,
                isSystem: false,
                imageUrl: userMsg.imageUrl || 'https://picsum.photos/seed/foto/500/400'
              }
            ]);
          }, 400);

        } else if (command === 'video') {
          isMatched = true;
          matchedCommand = 'video';
          addTerminalLog(`[Route Engine] Match found: Object Key "video"`);
          addTerminalLog(`[Action Executor] Resolving action: Video("mixkit-funny-cat-with-glasses-40200-large.mp4", "video nya lucu banget")`);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueMsgId(),
                sender: 'bot',
                senderName: 'W2B Bot',
                role: 'owner',
                text: 'video nya lucu banget',
                time: messageTime,
                isBot: true,
                isSystem: false,
                type: 'video',
                videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-funny-cat-with-glasses-40200-large.mp4'
              }
            ]);
          }, 500);

        } else if (command === 'say') {
          isMatched = true;
          matchedCommand = 'say';
          const args = words.slice(1).join(' ');
          addTerminalLog(`[Route Engine] Match found: Object Key "say"`);
          addTerminalLog(`[Placeholders] Evaluating Arg(1, 10) -> "${args || 'empty'}"`);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueMsgId(),
                sender: 'bot',
                senderName: 'W2B Bot',
                role: 'owner',
                text: args || 'hello',
                time: messageTime,
                isBot: true,
                isSystem: false
              }
            ]);
          }, 400);

        } else if (command === 'niga') {
          isMatched = true;
          matchedCommand = 'niga';
          addTerminalLog(`[Route Engine] Match found: Object Key "niga"`);
          addTerminalLog(`[Placeholders] Evaluating Mention(GetUsrId()) -> "@${senderNumber}"`);
          addTerminalLog(`[Action Executor] Resolving array: [Text, Ban(GetUsrId())]`);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueMsgId(),
                sender: 'bot',
                senderName: 'W2B Bot',
                role: 'owner',
                text: `Anggota @${senderNumber} mengatakan kata terlarang`,
                time: messageTime,
                isBot: true,
                isSystem: false
              }
            ]);
            addTerminalLog(`[Action Executor] Ban execution initiated for JID: ${senderNumber}@s.whatsapp.net`);
          }, 400);

          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: getUniqueMsgId(),
                sender: 'system',
                senderName: 'System',
                role: 'owner',
                text: `🚫 Bot Owner removed @${senderNumber} from the group.`,
                time: messageTime,
                isBot: false,
                isSystem: true
              }
            ]);
            addTerminalLog(`[W2B Engine] Group participant update: @${senderNumber} removed successfully.`);
          }, 1200);

        } else if (command === 'hei') {
          isMatched = true;
          matchedCommand = 'hei';
          addTerminalLog(`[Route Engine] Match found: Object Key "hei"`);
          addTerminalLog(`[Sub-Command] Loading command file: "/commands/hei.js"`);
          addTerminalLog(`[Sub-Command] Evaluating local Setup({ GrubOnly: true }) override.`);

          if (!isGroupChat) {
            addTerminalLog(`[Security Filter] Local GrubOnly override failed! Command "hei" cannot be run in private chats.`);
            errorReason = 'Local GrubOnly constraint failed inside hei.js';
            triggerGuardFailure('hei', errorReason, messageTime);
          } else {
            addTerminalLog(`[Security Filter] Local GrubOnly validation passed.`);
            addTerminalLog(`[Action Executor] Resolving action: Text("hai juga")`);
            
            setTimeout(() => {
              setMessages(prev => [
                ...prev,
                {
                  id: getUniqueMsgId(),
                  sender: 'bot',
                  senderName: 'W2B Bot',
                  role: 'owner',
                  text: 'hai juga',
                  time: messageTime,
                  isBot: true,
                  isSystem: false
                }
              ]);
            }, 400);
          }
        }
      }

      if (!isMatched && command.startsWith('/')) {
        addTerminalLog(`[Route Engine] Message starting with "/" was ignored (No matching route for "${command}").`);
      }
    }, 600);
  };

  // BOT EXECUTIONS
  const executePing = (triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/ping")`);
    addTerminalLog(`[Action Executor] Resolving action: Text("Pong! 🏓")`);
    setMessages(prev => [
      ...prev,
      {
        id: getUniqueMsgId(),
        sender: 'bot',
        senderName: 'W2B Bot',
        role: 'owner',
        text: 'Pong! 🏓',
        time,
        isBot: true,
        isSystem: false
      }
    ]);
  };

  const executeEcho = (content: string, triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/echo")`);
    addTerminalLog(`[Placeholders] Evaluating Arg(1, Infinity) -> "${content || 'empty'}"`);
    
    const replyText = content ? `Echo: ${content}` : 'Usage: /echo <your-text>';
    addTerminalLog(`[Action Executor] Resolving action: Text("${replyText}")`);

    setMessages(prev => [
      ...prev,
      {
        id: getUniqueMsgId(),
        sender: 'bot',
        senderName: 'W2B Bot',
        role: 'owner',
        text: replyText,
        time,
        isBot: true,
        isSystem: false
      }
    ]);
  };

  const executeHello = (senderNum: string, triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/hello")`);
    addTerminalLog(`[Placeholders] Resolving GetUsrId() -> "${senderNum}@s.whatsapp.net"`);
    addTerminalLog(`[Placeholders] Resolving Mention() -> JID mentioned in metadata.`);
    addTerminalLog(`[Action Executor] Resolving action: Text("Greetings @${senderNum}!")`);

    setMessages(prev => [
      ...prev,
      {
        id: getUniqueMsgId(),
        sender: 'bot',
        senderName: 'W2B Bot',
        role: 'owner',
        text: `Greetings @${senderNum}! Hope you are having an amazing day. 💫`,
        time,
        isBot: true,
        isSystem: false
      }
    ]);
  };

  const triggerGuardFailure = (commandName: string, reason: string, time: string) => {
    addTerminalLog(`[Security Filter] Blocked command "${commandName}": ${reason}`);
    // No response in chat (as expected), but show log console warning.
  };

  const executeKick = (senderNum: string, senderName: string, triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/kick")`);
    addTerminalLog(`[Security Filter] Pass AdminOnly validation (Role: ${simRole}).`);
    addTerminalLog(`[Placeholders] Resolving GetUsrId() -> "${senderNum}@g.us"`);
    addTerminalLog(`[Action Executor] Resolving actions: [Text("Removing user..."), Ban(GetUsrId())]`);

    setMessages(prev => [
      ...prev,
      {
        id: getUniqueMsgId(),
        sender: 'bot',
        senderName: 'W2B Bot',
        role: 'owner',
        text: `Removing participant ${senderName} from the group... 🚪`,
        time,
        isBot: true,
        isSystem: false
      },
      {
        id: getUniqueMsgId(),
        sender: 'system',
        senderName: 'System',
        role: 'owner',
        text: `🚨 @${senderNum} was removed from the group by W2B Bot.`,
        time,
        isBot: false,
        isSystem: true,
        type: 'ban'
      }
    ]);
  };

  const executeDelete = (triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/delete")`);
    addTerminalLog(`[Security Filter] Pass AdminOnly validation.`);
    addTerminalLog(`[Action Executor] Resolving action: Delete()`);

    setMessages(prev => {
      // Find the last user message and mark it deleted
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (!updated[i].isBot && !updated[i].isSystem && !updated[i].isDeleted) {
          updated[i] = { ...updated[i], isDeleted: true };
          break;
        }
      }
      return updated;
    });

    addTerminalLog(`[W2B Socket] Message ${triggerId} deleted successfully via sendMessage(chat, { delete: msg.key }).`);
  };

  const executeWarn = (senderNum: string, triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/warn")`);
    addTerminalLog(`[Security Filter] Pass GrubOnly validation.`);
    addTerminalLog(`[Action Executor] Resolving action: Text("Swearing warning")`);

    setMessages(prev => [
      ...prev,
      {
        id: getUniqueMsgId(),
        sender: 'bot',
        senderName: 'W2B Bot',
        role: 'owner',
        text: `⚠️ Swearing warning @${senderNum}! Foul language is strictly prohibited in this group.`,
        time,
        isBot: true,
        isSystem: false
      }
    ]);
  };

  const executeVote = (triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/vote")`);
    addTerminalLog(`[Action Executor] Resolving action: Poll(question, options)`);

    setMessages(prev => [
      ...prev,
      {
        id: getUniqueMsgId(),
        sender: 'bot',
        senderName: 'W2B Bot',
        role: 'owner',
        text: 'Native WhatsApp Poll',
        time,
        isBot: true,
        isSystem: false,
        type: 'poll',
        pollQuestion: 'What is W2B designed for?',
        pollOptions: [
          { text: 'Speed & Hot Reload', votes: 0 },
          { text: 'Declarative Actions', votes: 0 },
          { text: 'Guards & Decorators', votes: 0 },
          { text: 'All of the above!', votes: 0 }
        ]
      }
    ]);
  };

  const executeSticker = (hasImage: boolean, imgUrl: string | null, triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/sticker")`);
    addTerminalLog(`[Placeholders] Evaluating GetMedia()...`);

    if (!hasImage) {
      addTerminalLog(`[Placeholders] GetMedia() returned null (No image attachment found on trigger message).`);
      addTerminalLog(`[Action Executor] Resolving action: Text("Error message")`);
      setMessages(prev => [
        ...prev,
        {
          id: getUniqueMsgId(),
          sender: 'bot',
          senderName: 'W2B Bot',
          role: 'owner',
          text: '❌ Error: No media found! Please attach a simulated image first using the paperclip icon (📷 Attach Image) and try again.',
          time,
          isBot: true,
          isSystem: false
        }
      ]);
    } else {
      addTerminalLog(`[Placeholders] GetMedia() parsed successfully. Saved temp image to "/temp/media_${Math.floor(Math.random() * 90000)}.jpg"`);
      addTerminalLog(`[Action Executor] Resolving action: Sticker("/temp/media_xxx.jpg")`);

      setMessages(prev => [
        ...prev,
        {
          id: getUniqueMsgId(),
          sender: 'bot',
          senderName: 'W2B Bot',
          role: 'owner',
          text: 'Sticker Bubble',
          time,
          isBot: true,
          isSystem: false,
          type: 'sticker',
          imageUrl: imgUrl || 'https://picsum.photos/seed/sticker/150/150'
        }
      ]);

      // Simulate cleanup
      setTimeout(() => {
        addTerminalLog(`[W2B Lifecycle] Cleared temporary file: "/temp/media_xxx.jpg"`);
      }, 1000);
    }
  };

  const executeSystem = (triggerId: string, time: string) => {
    addTerminalLog(`[Route Engine] Match found: Route("/system")`);
    addTerminalLog(`[Security Filter] Pass OwnerOnly validation.`);
    addTerminalLog(`[Action Executor] Resolving multi-action array: [Text, Text, Location]`);

    // We send them sequentially with tiny intervals to simulate network delays!
    setTimeout(() => {
      addTerminalLog(`[Action Executor] Sending message 1/3: Text("Contacting server...")`);
      setMessages(prev => [
        ...prev,
        {
          id: getUniqueMsgId(),
          sender: 'bot',
          senderName: 'W2B Bot',
          role: 'owner',
          text: 'Contacting server... 📡',
          time,
          isBot: true,
          isSystem: false
        }
      ]);
    }, 400);

    setTimeout(() => {
      addTerminalLog(`[Action Executor] Sending message 2/3: Text("Running health checks...")`);
      setMessages(prev => [
        ...prev,
        {
          id: getUniqueMsgId(),
          sender: 'bot',
          senderName: 'W2B Bot',
          role: 'owner',
          text: 'Running health checks... ALL SYSTEMS OK! ✅',
          time,
          isBot: true,
          isSystem: false
        }
      ]);
    }, 1000);

    setTimeout(() => {
      addTerminalLog(`[Action Executor] Sending message 3/3: Location(-6.2088, 106.8456)`);
      setMessages(prev => [
        ...prev,
        {
          id: getUniqueMsgId(),
          sender: 'bot',
          senderName: 'W2B Bot',
          role: 'owner',
          text: 'Location Pin',
          time,
          isBot: true,
          isSystem: false,
          type: 'location',
          location: {
            name: 'W2B Active Node',
            address: 'Region: Jakarta Cluster 1A, Indonesia',
            lat: -6.2088,
            lng: 106.8456
          }
        }
      ]);
    }, 1600);
  };

  // Simulates voting in a poll
  const handleVoteInPoll = (msgId: string, optionIndex: number) => {
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === msgId && msg.pollOptions) {
          const opts = [...msg.pollOptions];
          opts[optionIndex] = {
            ...opts[optionIndex],
            votes: opts[optionIndex].votes + 1
          };
          
          addTerminalLog(`[W2B Socket] Registered poll vote on option index ${optionIndex}: "${opts[optionIndex].text}"`);
          return { ...msg, pollOptions: opts };
        }
        return msg;
      });
    });
  };

  // Attach sample image
  const handleAttachImage = () => {
    setAttachedImage('https://picsum.photos/seed/attachment/300/300');
    addTerminalLog(`[Simulator] Prepared simulated image attachment. Type "/sticker" and send to see sticker conversion!`);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'sys-start-cleared',
        sender: 'system',
        senderName: 'System',
        role: 'owner',
        text: '🧹 Chat cleared. Simulator listening.',
        time: getFormattedTime(),
        isBot: false,
        isSystem: true
      }
    ]);
  };

  const activePreset = PLAYGROUND_PRESETS[activePresetIndex];

  // Colors keywords for custom IDE look
  const formatHighlightedCode = (codeText: string) => {
    const lines = codeText.split('\n');
    return lines.map((line, idx) => {
      // Basic formatting helper
      let formattedLine = line;
      
      // Keywords
      formattedLine = formattedLine.replace(/(Route|Include|Setup|Run|Text|Arg|GetUsrId|Mention|GetMedia|Sticker|Ban|Delete|Poll|Location|Reload)/g, '<span class="text-indigo-400 font-semibold">$1</span>');
      // Chained methods
      formattedLine = formattedLine.replace(/(\.GrubOnly\(\)|\.AdminOnly\(\)|\.OwnerOnly\(\)|\.PrivateOnly\(\))/g, '<span class="text-red-400 font-medium">$1</span>');
      // Comments
      formattedLine = formattedLine.replace(/(\/\/.*)$/g, '<span class="text-slate-500 italic">$1</span>');
      // Strings
      formattedLine = formattedLine.replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>');
      
      return (
        <div key={idx} className="flex font-mono text-xs leading-relaxed py-0.5">
          <span className="w-6 text-slate-600 text-right pr-2 select-none font-semibold text-[10px]">{idx + 1}</span>
          <span className="flex-1 whitespace-pre-wrap pl-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" id="playground-container">
      {/* LEFT COLUMN - IDE & Presets (5 cols) */}
      <div className="xl:col-span-5 space-y-6">
        {/* Preset Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3" id="playground-presets">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-500" />
            <span>Select Bot Script Preset</span>
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {PLAYGROUND_PRESETS.map((p, pIdx) => {
              const isActive = activePresetIndex === pIdx;
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    setActivePresetIndex(pIdx);
                    addTerminalLog(`[Simulator] Switched active bot script to: "${p.name}"`);
                  }}
                  className={cn(
                    "text-left p-3.5 border rounded-xl transition-all relative group",
                    isActive 
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm" 
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  )}
                  id={`preset-${pIdx}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-bold", isActive ? "text-indigo-700" : "text-slate-800")}>
                      {p.name}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold uppercase rounded-md tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mock IDE Code Editor */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl shadow-md overflow-hidden flex flex-col" id="mock-ide">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400 text-xs font-mono ml-2 font-semibold select-none">bot_routes.js</span>
            </div>
            
            {/* Hot Reload Button */}
            <button
              onClick={handleHotReload}
              disabled={isHotReloading}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 hover:text-white text-slate-300 font-semibold rounded-lg text-[11px] transition-colors",
                isHotReloading && "opacity-50 cursor-not-allowed"
              )}
              title="Simulate pressing Ctrl+R in terminal to restart bot"
              id="hot-reload-btn"
            >
              <RotateCw className={cn("w-3 h-3", isHotReloading && "animate-spin")} />
              <span>{isHotReloading ? 'Reloading...' : 'Hot Reload (Ctrl+R)'}</span>
            </button>
          </div>

          {/* IDE Editor Lines Container */}
          <div className="p-4 bg-slate-950 overflow-x-auto min-h-[220px] max-h-[300px] overflow-y-auto select-text custom-scrollbar">
            {formatHighlightedCode(activePreset.code)}
          </div>

          {/* Configuration Parameters Panel */}
          <div className="p-4 bg-slate-900/60 border-t border-slate-900 text-slate-400 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-bold tracking-tight text-[10px] uppercase text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Underlying Setup</span>
              </span>
              <span className="font-mono text-[9px] text-indigo-400 uppercase font-bold">active config</span>
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-[11px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
              <div>
                <span className="text-slate-500">Owner Number:</span>{' '}
                <span className="text-indigo-300">
                  {activePresetIndex === 3 ? '"087718761419"' : activePresetIndex === 2 ? '"628999999999"' : '"628571234567"'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Session Name:</span>{' '}
                <span className="text-emerald-300">
                  {activePresetIndex === 3 ? '"bot-pairing"' : activePresetIndex === 0 ? '"W2B_Demo"' : '"W2B_Sandbox"'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Auth Method:</span>{' '}
                <span className="text-amber-300">
                  {activePresetIndex === 0 || activePresetIndex === 2 ? 'QR Code' : 'Pairing Code'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Framework:</span>{' '}
                <span className="text-pink-300">
                  {activePresetIndex === 3 ? 'w2b v2.0.0 (Object API)' : 'w2b v1.0.4'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - WhatsApp Client & Logs (7 cols) */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Environment & Role Controller */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="playground-controls">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Role selection */}
            <div className="w-full space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Simulated Sender JID / Role:</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                {(['member', 'admin', 'owner'] as const).map((r) => {
                  const label = r === 'member' ? 'Member' : r === 'admin' ? 'Admin' : 'Owner';
                  const isSelected = simRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setSimRole(r);
                        addTerminalLog(`[Simulator] Switched active sender role to: "${label.toUpperCase()}"`);
                      }}
                      className={cn(
                        "py-1.5 px-3 text-xs font-semibold rounded-lg transition-all",
                        isSelected 
                          ? "bg-white text-slate-800 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                      id={`role-btn-${r}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat environment */}
            <div className="w-full space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. WhatsApp Chat Location:</span>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { key: true, label: 'Group Chat', icon: <Users className="w-3.5 h-3.5" /> },
                  { key: false, label: 'Private DM', icon: <User className="w-3.5 h-3.5" /> }
                ].map((env) => {
                  const isSelected = isGroupChat === env.key;
                  return (
                    <button
                      key={env.label}
                      onClick={() => {
                        setIsGroupChat(env.key);
                        addTerminalLog(`[Simulator] Environment context changed to: "${env.label}"`);
                      }}
                      className={cn(
                        "py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        isSelected 
                          ? "bg-white text-slate-800 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                      id={`env-btn-${env.key}`}
                    >
                      {env.icon}
                      <span>{env.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Mock Simulator Frame */}
        <div className="border border-slate-200 rounded-2xl shadow-md overflow-hidden bg-[#e5ddd5] flex flex-col h-[520px]" id="whatsapp-simulator">
          {/* Header */}
          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shadow-inner uppercase select-none">
                  {isGroupChat ? 'W2' : 'WB'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide select-none">
                  {isGroupChat ? 'W2B Testing Group 💬' : 'W2B Sandbox Bot 🤖'}
                </h3>
                <span className="text-[10px] text-slate-200 select-none">
                  {isGroupChat ? 'W2B, Member, Admin, Owner' : 'Online'}
                </span>
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClearChat}
              className="text-slate-200 hover:text-white p-1.5 hover:bg-emerald-800/50 rounded-lg transition-colors"
              title="Clear active chat conversation"
              id="clear-chat-btn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 custom-scrollbar"
            style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundBlendMode: 'overlay', backgroundColor: 'rgba(229, 221, 213, 0.94)' }}
          >
            {messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-1 select-none">
                    <span className="px-3 py-1 bg-slate-600/10 backdrop-blur-xs text-slate-600 text-[10px] font-bold rounded-lg border border-slate-300/30 text-center max-w-[85%] leading-relaxed shadow-xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              if (msg.isDeleted) {
                return (
                  <div key={msg.id} className="flex justify-center my-1 select-none">
                    <span className="px-3 py-1 bg-slate-600/10 backdrop-blur-xs text-slate-500 italic text-[10.5px] rounded-lg border border-slate-300/20">
                      🚫 A message from @{msg.sender.split('@')[0]} was deleted by the bot routing.
                    </span>
                  </div>
                );
              }

              const isOwn = msg.isBot; // Bot alignment (left) vs User alignment (right)
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    isOwn ? "self-start items-start" : "self-end items-end ml-auto"
                  )}
                >
                  <div 
                    className={cn(
                      "p-2.5 rounded-xl shadow-xs leading-relaxed relative",
                      isOwn 
                        ? "bg-white text-slate-800 rounded-tl-none border border-slate-200" 
                        : "bg-[#dcf8c6] text-slate-800 rounded-tr-none"
                    )}
                  >
                    {/* Participant Sender Tag (In groups for clarity) */}
                    {isGroupChat && !isOwn && (
                      <div className="text-[10px] font-bold mb-1 flex items-center gap-1 select-none">
                        <span className={cn(
                          msg.role === 'owner' ? "text-pink-600" : msg.role === 'admin' ? "text-red-500" : "text-blue-500"
                        )}>
                          @{msg.sender.split('@')[0]}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 bg-slate-100 text-slate-400 font-bold rounded-sm border border-slate-200 uppercase scale-90">
                          {msg.role}
                        </span>
                      </div>
                    )}

                    {/* Image Attachment (For /sticker demo) */}
                    {msg.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 mb-2 max-w-[200px]">
                        <img 
                          src={msg.imageUrl} 
                          alt="Simulated Media" 
                          className="w-full h-auto object-cover max-h-40"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-[9px] text-white rounded font-bold uppercase select-none flex items-center gap-1">
                          <FileImage className="w-2.5 h-2.5" />
                          <span>{isOwn ? 'W2B Image Action' : 'GetMedia() Attachment'}</span>
                        </div>
                      </div>
                    )}

                    {/* Chat Bubble Types */}
                    {msg.type === 'poll' && msg.pollQuestion && msg.pollOptions ? (
                      <div className="space-y-3.5 min-w-[220px] max-w-[300px] bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-xs">
                        <div className="border-b border-slate-100 pb-1.5">
                          <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wide select-none">📊 WhatsApp Native Poll</span>
                          <h4 className="font-bold text-xs text-slate-800 mt-0.5">{msg.pollQuestion}</h4>
                        </div>
                        <div className="space-y-2">
                          {msg.pollOptions.map((opt, oIdx) => {
                            const totalVotes = msg.pollOptions?.reduce((a, b) => a + b.votes, 0) || 0;
                            const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                            return (
                              <button
                                key={opt.text}
                                onClick={() => handleVoteInPoll(msg.id, oIdx)}
                                className="w-full text-left p-2 rounded-lg bg-white border border-slate-100 hover:border-indigo-200 text-xs flex flex-col gap-1 transition-all group/opt"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-semibold text-slate-700 group-hover/opt:text-indigo-600">{opt.text}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{opt.votes} votes</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : msg.type === 'video' && msg.videoUrl ? (
                      <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-900 max-w-[260px] flex flex-col shadow-xs relative">
                        <video 
                          src={msg.videoUrl} 
                          controls
                          className="w-full h-auto max-h-48 object-cover rounded-t-xl"
                        />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] text-white rounded font-bold uppercase select-none flex items-center gap-1">
                          <span>W2B Video Action</span>
                        </div>
                      </div>
                    ) : msg.type === 'location' && msg.location ? (
                      <div className="min-w-[210px] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        <div className="h-24 bg-sky-100 relative flex items-center justify-center font-bold text-[10px] text-sky-600 select-none">
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(#0ea5e9 1px, transparent 1px)`, backgroundSize: '12px 12px' }} />
                          <div className="z-10 text-center space-y-1">
                            <span className="text-xl">📍</span>
                            <div>lat: {msg.location.lat} / lng: {msg.location.lng}</div>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <h4 className="font-bold text-xs text-slate-800">{msg.location.name}</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{msg.location.address}</p>
                        </div>
                      </div>
                    ) : msg.type === 'sticker' && msg.imageUrl ? (
                      <div className="rounded-xl overflow-hidden bg-transparent border-0 max-w-[140px] flex items-center justify-center py-2 select-none">
                        <img 
                          src={msg.imageUrl} 
                          alt="Simulated Sticker" 
                          className="w-24 h-24 object-cover rounded-2xl border border-slate-200/50 shadow-sm"
                        />
                      </div>
                    ) : (
                      // Default TEXT rendering (with placeholder highlights)
                      <p className="text-xs font-medium tracking-wide leading-relaxed break-words whitespace-pre-wrap">
                        {msg.text.split(/(@628\d+)/g).map((word, wIdx) => {
                          if (word.startsWith('@628')) {
                            return (
                              <span key={wIdx} className="text-blue-600 font-semibold select-all hover:underline">
                                {word}
                              </span>
                            );
                          }
                          return word;
                        })}
                      </p>
                    )}

                    {/* Time & Sent Check */}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-medium select-none text-right mt-1.5">
                      <span>{msg.time}</span>
                      {isOwn && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Attachment Preview (if simulated photo attached) */}
          {attachedImage && (
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between" id="attached-preview">
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300">
                  <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Simulated Image Attachment</h4>
                  <p className="text-[10px] text-slate-400">Media source ready to be caught by GetMedia()</p>
                </div>
              </div>
              <button 
                onClick={() => setAttachedImage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="bg-[#f0f0f0] px-4 py-2.5 flex items-center gap-3 border-t border-slate-200">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={handleAttachImage}
              title="Attach Simulated Image (for /sticker)"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors relative"
              id="attachment-btn"
            >
              <Paperclip className="w-5 h-5" />
              {attachedImage && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type command (e.g., /ping, /echo hello, /vote, /sticker)..."
              className="flex-1 px-4 py-2 bg-white text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
              id="message-input"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="p-2.5 bg-[#128c7e] hover:bg-[#075e54] text-white rounded-full transition-all shadow-sm active:scale-95"
              id="send-message-btn"
            >
              <Send className="w-4 h-4 fill-white" />
            </button>
          </form>
        </div>

        {/* Real-time Embedded W2B Log Console */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 select-none">
            <span className="font-bold text-[10px] uppercase tracking-wider font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Embedded W2B Log Console</span>
            </span>
            <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">stdout</span>
          </div>
          
          <div 
            ref={consoleContainerRef}
            className="h-28 overflow-y-auto font-mono text-[10px] text-slate-300 leading-normal space-y-1 custom-scrollbar pr-2 select-text"
          >
            {terminalLogs.map((log, lIdx) => {
              // Highlight system events or security blockages
              let lineClass = "text-slate-300";
              if (log.includes("[Security Filter]")) {
                lineClass = "text-red-400 font-semibold";
              } else if (log.includes("[Route Engine] Match found")) {
                lineClass = "text-emerald-400 font-semibold";
              } else if (log.includes("🔄")) {
                lineClass = "text-amber-400 font-semibold";
              } else if (log.includes("[W2B Socket]") || log.includes("[Action Executor]")) {
                lineClass = "text-indigo-300";
              }
              return (
                <div key={lIdx} className={lineClass}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
