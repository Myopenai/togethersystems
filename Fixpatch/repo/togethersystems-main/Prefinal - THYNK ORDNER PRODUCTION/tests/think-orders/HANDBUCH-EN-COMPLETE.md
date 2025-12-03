# 📚 Think Orders - Complete Handbook for Beginners (English)

## 🎯 For Complete Beginners - Step by Step

This handbook explains **everything from the beginning** - even if you've never seen a terminal or test suite before.

---

## 📋 Table of Contents

1. [What is a Terminal?](#1-what-is-a-terminal)
2. [Opening Terminal - Step by Step](#2-opening-terminal-step-by-step)
3. [Basic Terminal Commands](#3-basic-terminal-commands)
4. [Installing Tests - Step by Step](#4-installing-tests-step-by-step)
5. [Running Tests - Step by Step](#5-running-tests-step-by-step)
6. [Understanding Test Results](#6-understanding-test-results)
7. [Adding Your Own Tests](#7-adding-your-own-tests)
8. [Extension Possibilities](#8-extension-possibilities)
9. [Troubleshooting](#9-troubleshooting)
10. [Further Resources](#10-further-resources)

---

## 1. What is a Terminal?

### Simply Explained

A **Terminal** is a **text interface** to your computer. Instead of clicking, you type **commands as text**.

**Comparison:**
- **Graphical Interface (GUI)**: You click with mouse on icons
- **Terminal (CLI)**: You type commands

### Why Terminal?

- ✅ **Faster** - Direct commands
- ✅ **More Precise** - Exact control
- ✅ **Automatable** - Repeatable steps
- ✅ **Professional** - Standard for developers

---

## 2. Opening Terminal - Step by Step

### Windows

#### Method 1: PowerShell (Recommended)

1. **Press Windows key** (key with Windows logo)
2. **Type "PowerShell"**
3. **Click "Windows PowerShell"**
4. **Done!** Black window opens

#### Method 2: CMD (Command Prompt)

1. **Press Windows key + R**
2. **Type "cmd"**
3. **Press Enter**
4. **Done!**

#### Method 3: Via File Explorer

1. **Open File Explorer**
2. Navigate to folder: `THYNK ORDNER PRODUCTION`
3. **Click address bar** (where path is shown)
4. **Type "powershell"**
5. **Press Enter**
6. **Done!**

### What You See

```
PS D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\THYNK ORDNER PRODUCTION>
```

**Explanation:**
- `PS` = PowerShell (type of terminal)
- Long text after = **Your current folder** (Working Directory)
- `>` = Ready for commands

### ⚠️ IMPORTANT: Path with Spaces

If your path contains **spaces** (like `THYNK ORDNER PRODUCTION`), you must use **quotes**:

```powershell
cd "THYNK ORDNER PRODUCTION"
```

**NOT like this:**
```powershell
cd THYNK ORDNER PRODUCTION  ❌ ERROR!
```

**But like this:**
```powershell
cd "THYNK ORDNER PRODUCTION"  ✅ CORRECT!
```

---

## 3. Basic Terminal Commands

### cd - Change Directory

**Meaning:** Change Directory (switch folder)

**Example:**
```powershell
cd "tests\think-orders"
```

**What happens:** You go to folder `tests\think-orders`

**Tip:** Press Tab key for auto-completion!

### ls / dir - Show Files

**Windows PowerShell:**
```powershell
ls
```
or
```powershell
dir
```

**What happens:** You see all files and folders in current directory

**Example output:**
```
    Directory: D:\...\tests\think-orders

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        15.01.2024     10:00                helpers
-a----        15.01.2024     10:00            1234 package.json
-a----        15.01.2024     10:00            5678 playwright.config.ts
```

### cd .. - Go Back One Folder

```powershell
cd ..
```

**What happens:** You go back one folder (up)

**Example:**
- You are in: `tests\think-orders`
- After `cd ..`: You are in `tests`
- After `cd ..` again: You are in `THYNK ORDNER PRODUCTION`

### pwd - Show Current Folder

**Windows PowerShell:**
```powershell
pwd
```
or
```powershell
Get-Location
```

**What happens:** You see your current path

**Example output:**
```
Path
----
D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\THYNK ORDNER PRODUCTION\tests\think-orders
```

### cls / Clear-Host - Clear Screen

```powershell
cls
```
or
```powershell
Clear-Host
```

**What happens:** Terminal screen becomes empty (all previous output disappears)

### Tip: Auto-completion with Tab

1. **Type beginning letters** (e.g. `cd te`)
2. **Press Tab key**
3. **Terminal auto-completes** (e.g. to `cd tests`)

**Press Tab multiple times** = Switches between possibilities

---

## 4. Installing Tests - Step by Step

### Step 1: Install Node.js

**IMPORTANT:** Node.js must be installed!

#### Check if Node.js is installed:

```powershell
node --version
```

**If shown:** `v20.10.0` (or similar)
✅ **Node.js is installed!**

**If shown:** `'node' is not recognized...`
❌ **Node.js must be installed!**

#### Install Node.js:

1. **Open browser**
2. Go to: **https://nodejs.org/**
3. **Click Download button** (LTS version recommended)
4. **Download installation file**
5. **Run installation:**
   - Double-click `.msi` file
   - Click "Next" (multiple times)
   - Click "Install"
   - Wait until finished
   - Click "Finish"
6. **RESTART terminal** (important!)
7. Check: `node --version`

#### Check NPM:

```powershell
npm --version
```

**If shown:** `10.2.3` (or similar)
✅ **NPM is installed!**

### Step 2: Go to Test Folder

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\THYNK ORDNER PRODUCTION\tests\think-orders"
```

**OR step by step:**

```powershell
cd "THYNK ORDNER PRODUCTION"
cd tests
cd think-orders
```

### Step 3: Check if You're in Right Folder

```powershell
ls
```

**You should see:**
- `package.json`
- `playwright.config.ts`
- `think-orders.spec.ts`
- `helpers/` (folder)
- `README.md`

### Step 4: Install Dependencies

```powershell
npm install
```

**What happens:**
- Terminal automatically downloads all needed programs
- This can take **2-5 minutes**
- You see many lines with downloads

**Wait until you see:**
```
added 123 packages, and audited 124 packages in 2m
```

**✅ Done!** Dependencies are installed.

### Step 5: Install Browsers

```powershell
npx playwright install
```

**What happens:**
- Playwright automatically installs browsers (Chromium, Firefox, WebKit)
- This can take **5-10 minutes**
- You see progress indicators

**Wait until you see:**
```
✓ Successfully installed Chromium
✓ Successfully installed Firefox
✓ Successfully installed WebKit
```

**✅ Done!** Browsers are installed.

---

## 5. Running Tests - Step by Step

### Simplest Method: All Tests

```powershell
npm test
```

**What happens:**
- All tests run one after another
- Terminal shows progress
- At end you see a summary

**Example output:**
```
Running 30 tests using 5 workers

  ✓ tests/think-orders/think-orders.spec.ts:12:3 › Navigation › Home page should load (2.1s)
  ✓ tests/think-orders/think-orders.spec.ts:15:3 › Navigation › Navigate to User Center (1.8s)
  ...
  
  30 passed (120s)
```

**✅ All tests passed!**

### With Browser Visible (headed mode)

```powershell
npm run test:headed
```

**What happens:**
- Browser windows open automatically
- You **see** how tests are executed
- Good for understanding and debugging

### Only Specific Browser

```powershell
npm run test:chromium    # Only Google Chrome
npm run test:firefox     # Only Firefox
npm run test:webkit      # Only Safari
npm run test:mobile      # Only Mobile tests
```

### Debug Mode (Slow, Step by Step)

```powershell
npm run test:debug
```

**What happens:**
- Browser opens
- Test runs **step by step**
- You can observe each step
- Good for beginners to understand

**To continue:** Click "Resume" in debug console or press `F8`

### UI Mode (Visual)

```powershell
npm run test:ui
```

**What happens:**
- Browser opens with **visual interface**
- You see all tests in a list
- You can select tests individually
- Very user-friendly!

---

## 6. Understanding Test Results

### Successful Tests

```
✓ Navigation › Home page should load (2.1s)
```

**Meaning:**
- `✓` = Test **passed**
- `Navigation › Home page should load` = Test name
- `(2.1s)` = Duration in seconds

### Failed Tests

```
✗ Orders › Create order should work (5.3s)
   Error: expect(received).toBeVisible()
   Expected: visible
   Received: hidden
```

**Meaning:**
- `✗` = Test **failed**
- `Error:` = Error message
- `Expected: visible` = Expected was: visible
- `Received: hidden` = Actually was: hidden

### Summary

At the end you see:

```
  30 passed (120s)
```

**Meaning:**
- `30` = Number of successful tests
- `passed` = all passed
- `(120s)` = Total duration: 2 minutes

### View Test Report

```powershell
npm run test:report
```

**What happens:**
- Browser opens automatically
- You see an **HTML report**
- With screenshots on errors
- With videos on errors
- With detailed information

---

## 7. Adding Your Own Tests

### Step 1: Open File

Open with a **text editor** (Notepad++, VS Code, etc.):

```
tests\think-orders\think-orders.spec.ts
```

### Step 2: Add Test

Add at end of file:

```typescript
test.describe('My new tests', () => {
  test('My first test', async ({ page }) => {
    // Test code here
  });
});
```

### Step 3: Run Test

```powershell
npm test
```

**See `ERWEITERUNGS-ANLEITUNG.md` for detailed examples!**

---

## 8. Extension Possibilities

### A) Test New Features

When you add new features to the app, add tests too.

**Example:** New page "Reports"
→ New test block in `think-orders.spec.ts`

### B) Performance Tests

Test how fast the app is:

```typescript
test('Page loads quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto(...);
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000); // Under 2 seconds
});
```

### C) Accessibility Tests

Test if app is accessible for everyone:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('Page is accessible', async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page);
});
```

**→ See `ERWEITERUNGS-ANLEITUNG.md` for more!**

---

## 9. Troubleshooting

### Problem: "node is not recognized"

**Solution:**
1. Install Node.js: https://nodejs.org/
2. **RESTART terminal**
3. Try again

### Problem: "npm is not recognized"

**Solution:**
1. NPM is part of Node.js
2. Reinstall Node.js completely
3. RESTART terminal

### Problem: Tests Fail

**Solution:**
1. Check if HTML file exists:
   ```powershell
   ls "..\..\THYNK-ORDERS-COMPLETE-ALL-PAGES.html"
   ```
2. Install browsers:
   ```powershell
   npx playwright install
   ```
3. Run with `--headed` to see what happens:
   ```powershell
   npm run test:headed
   ```

### Problem: "CORS Errors"

**Solution:**
- Tests work with `file://` protocol
- If errors occur, check HTML file

### Problem: Tests Run Too Slow

**Solution:**
- Normal: 30 tests = 2-5 minutes
- If much slower: Check internet connection

---

## 10. Further Resources

### Official Documentation

- **Playwright:** https://playwright.dev/
  - Complete documentation
  - Examples
  - API reference

### Learning Resources

- **MDN Web Docs:** https://developer.mozilla.org/
  - Learn web technologies
  - JavaScript basics

- **W3Schools:** https://www.w3schools.com/
  - HTML, CSS, JavaScript tutorials
  - Step-by-step guides

### Learning Terminal

- **Windows PowerShell Documentation:**
  https://learn.microsoft.com/powershell/

- **Command Line Crash Course:**
  https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line

### Test Automation

- **Test Automation University:**
  https://testautomationu.applitools.com/

- **Playwright Learning Path:**
  https://playwright.dev/docs/intro

### Community & Support

- **Playwright Discord:**
  https://discord.gg/playwright

- **Stack Overflow:**
  https://stackoverflow.com/questions/tagged/playwright

### Scientific Resources

- **IEEE Software Testing:**
  https://www.computer.org/csdl/journal/st

- **ACM Digital Library - Testing:**
  https://dl.acm.org/topic/ccs2012/10003552

### Government & Standards

- **NIST - Software Testing:**
  https://www.nist.gov/software-quality-group

- **ISO/IEC Standards:**
  https://www.iso.org/standard/45142.html

### Educational Institutions

- **MIT OpenCourseWare - Software Engineering:**
  https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/

- **Stanford CS Courses:**
  https://cs.stanford.edu/

- **Harvard CS50:**
  https://cs50.harvard.edu/

---

## ✅ Checklist for Beginners

- [ ] Terminal opened
- [ ] Node.js installed (`node --version`)
- [ ] NPM installed (`npm --version`)
- [ ] In correct folder (`ls` shows `package.json`)
- [ ] Dependencies installed (`npm install`)
- [ ] Browsers installed (`npx playwright install`)
- [ ] First test run (`npm test`)
- [ ] Test report viewed (`npm run test:report`)

---

## 🎓 Next Steps

1. ✅ **Understand basics** (you are here!)
2. ✅ **Run tests** (`npm test`)
3. ✅ **Read extension guide** (`ERWEITERUNGS-ANLEITUNG.md`)
4. ✅ **Write own tests**
5. ✅ **Gain experience**

---

**Good luck! 🚀**

**For questions:** Read `ERWEITERUNGS-ANLEITUNG.md` or further resources above.

