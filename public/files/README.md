# LucasOS

A retro-themed, browser-based desktop OS — built for fun, design experiments, and showcasing my projects.

---

## What is LucasOS?

LucasOS is a retro-inspired fake operating system built entirely in the browser using React + TailwindCSS.
It's a playful developer playground where I showcase my projects, terminal UI ideas, design skills, and inject a lot of fun — with a nostalgic nod to classic interfaces like Windows 95/98.
The Design is heavily inspired by caelestial-dots/shell

---

## Features

- Desktop environment → Draggable & resizable windows, like a classic OS.
- Interactive terminal → Supports real commands (ls, cd, open, clear, etc.).
- File explorer → Browse and open apps & files.
- About Me app → Learn more about me directly in LucasOS.
- Retro dock → Pinned apps with a vintage vibe.
- Dynamic app loading → Launch apps via commands (open about, open terminal).
- Easter eggs & fake crashes.
- Boot screen animations → Playful loading screens inspired by old-school systems.
- Best on desktop → Mobile support is experimental for now.

---

## Tech Stack

- React + Vite
- Zustand (state management)
- TailwindCSS
- xterm.js (for terminal emulator)
- react-rnd (resizable, draggable windows)

---

## Available Terminal Commands

### **Basics**

- `help` → Show this help menu
- `clear` → Clear the terminal screen
- `echo [text]` → Print text back

---

### **File System**

- `ls [dir]` → List files and folders in a directory _(defaults to current directory)_
- `cd [dir]` → Change directory
- `pwd` → Show current working directory
- `mkdir [dir]` → Create a new directory
- `touch [file]` → Create a new file
- `cat [file]` → Show the contents of a file
- `rm [name]` → Delete a file or folder _(⚠ dangerous!)_
- `xdg-open [FILE|URL]` → Open a file or URL (PDF/text opens viewer)

---

### **Editor**

- `vim [files...]` → Open a minimal editor for one or more files

--

### **Apps & Windows**

- `open [app]` → Open an app _(e.g. `open about`)_
- `close [app]` → Close an app
- `minimize [app]` → Minimize an app window
- `maximize [app]` → Toggle fullscreen for an app

--

### **System Info**

- `whoami` → Show current user
- `date` → Display current date & time
- `uptime` → Show how long the terminal has been running
