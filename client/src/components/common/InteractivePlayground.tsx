import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import Editor from '@monaco-editor/react';
import { progressService } from '../../services/progressService';
import { 
  Play, CheckCircle, RefreshCw, ZoomIn, ZoomOut, Download, Copy, Maximize2, Minimize2 
} from 'lucide-react';

// --- MOCK SQL DATASET ---
const MOCK_DB = {
  users: [
    { id: 1, first_name: 'Alice', email: 'alice@example.com', active: true, age: 26 },
    { id: 2, first_name: 'Bob', email: 'bob@example.com', active: false, age: 30 },
    { id: 3, first_name: 'Charlie', email: 'charlie@example.com', active: true, age: 22 },
  ],
  products: [
    { id: 1, name: 'Laptop', price: 999, category: 'electronics' },
    { id: 2, name: 'Phone', price: 499, category: 'electronics' },
    { id: 3, name: 'Book', price: 15, category: 'books' },
    { id: 4, name: 'Desk', price: 150, category: 'furniture' },
  ],
  orders: [
    { id: 101, user_id: 1, amount: 999, status: 'shipped' },
    { id: 102, user_id: 3, amount: 15, status: 'delivered' },
    { id: 103, user_id: 1, amount: 150, status: 'pending' },
  ]
};

// --- LIGHTWEIGHT SQL PARSER & INTERPRETER ---
const runSQLQuery = (sql) => {
  try {
    const cleanSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();
    
    // Check basic SELECT syntax
    const selectMatch = cleanSql.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(.+?))?(?:\s+limit\s+(\d+))?;?$/);
    if (!selectMatch) {
      throw new Error("Syntax Error: Query must start with 'SELECT ... FROM ...'");
    }
    
    const colsStr = selectMatch[1].trim();
    const tableName = selectMatch[2].trim();
    const whereStr = selectMatch[3]?.trim();
    const orderStr = selectMatch[4]?.trim();
    const limitStr = selectMatch[5]?.trim();
    
    const table = MOCK_DB[tableName];
    if (!table) {
      throw new Error(`Table not found: "${tableName}". Available tables: users, products, orders`);
    }
    
    let rows = [...table];
    
    // Process WHERE
    if (whereStr) {
      const condMatch = whereStr.match(/^(\w+)\s*(=|>|<|!=)\s*(.+)$/);
      if (!condMatch) {
        throw new Error("WHERE Clause Error: Only simple filters like 'price > 50' or 'active = true' are supported.");
      }
      
      const col = condMatch[1].trim();
      const op = condMatch[2].trim();
      let valStr = condMatch[3].trim().replace(/['"]/g, '');
      
      rows = rows.filter(row => {
        let rowVal = row[col];
        if (rowVal === undefined) return false;
        
        let compareVal = valStr;
        if (typeof rowVal === 'number') {
          compareVal = parseFloat(valStr);
        } else if (typeof rowVal === 'boolean') {
          compareVal = valStr === 'true' || valStr === '1';
        }
        
        switch (op) {
          case '=': return rowVal === compareVal;
          case '!=': return rowVal !== compareVal;
          case '>': return rowVal > compareVal;
          case '<': return rowVal < compareVal;
          default: return false;
        }
      });
    }

    // Process ORDER BY
    if (orderStr) {
      const parts = orderStr.split(' ');
      const col = parts[0].trim();
      const desc = parts[1]?.trim() === 'desc';
      rows.sort((a, b) => {
        if (a[col] < b[col]) return desc ? 1 : -1;
        if (a[col] > b[col]) return desc ? -1 : 1;
        return 0;
      });
    }
    
    // Process LIMIT
    if (limitStr) {
      const limitVal = parseInt(limitStr, 10);
      rows = rows.slice(0, limitVal);
    }
    
    // Filter columns
    let finalRows = [];
    if (colsStr === '*') {
      finalRows = rows;
    } else {
      const selectedCols = colsStr.split(',').map(c => c.trim());
      selectedCols.forEach(col => {
        if (rows.length > 0 && rows[0][col] === undefined) {
          throw new Error(`Column not found: "${col}"`);
        }
      });
      
      finalRows = rows.map(row => {
        let newRow = {};
        selectedCols.forEach(col => {
          newRow[col] = row[col];
        });
        return newRow;
      });
    }
    
    return { success: true, rows: finalRows };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- LIGHTWEIGHT PYTHON INTERPRETER ---
const runPythonCode = (code) => {
  try {
    let logs = [];
    let variables = {};
    
    const lines = code.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;
      
      // Variable assignment
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        let expr = assignMatch[2].trim();
        
        if (expr.startsWith('"') || expr.startsWith("'")) {
          variables[varName] = expr.slice(1, -1);
        } else if (expr === 'True') {
          variables[varName] = true;
        } else if (expr === 'False') {
          variables[varName] = false;
        } else if (!isNaN(expr)) {
          variables[varName] = Number(expr);
        } else {
          if (variables[expr] !== undefined) {
            variables[varName] = variables[expr];
          } else {
            let evalExpr = expr;
            for (const [k, v] of Object.entries(variables)) {
              evalExpr = evalExpr.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
            }
            if (/^[0-9\s+\-*/()]+$/.test(evalExpr)) {
              variables[varName] = Function(`"use strict"; return (${evalExpr})`)();
            } else {
              throw new Error(`NameError: name '${expr}' is not defined`);
            }
          }
        }
        continue;
      }
      
      // Print statements
      const printMatch = line.match(/^print\s*\(\s*(.+?)\s*\)$/);
      if (printMatch) {
        let content = printMatch[1].trim();
        if (content.startsWith('"') || content.startsWith("'")) {
          logs.push(content.slice(1, -1));
        } else if (content.startsWith('f"') || content.startsWith("f'")) {
          let fStr = content.slice(2, -1);
          const braces = fStr.match(/\{(.+?)\}/g);
          if (braces) {
            braces.forEach(b => {
              const varName = b.slice(1, -1).trim();
              if (variables[varName] !== undefined) {
                fStr = fStr.replace(b, variables[varName]);
              } else {
                throw new Error(`NameError: name '${varName}' is not defined`);
              }
            });
          }
          logs.push(fStr);
        } else {
          if (variables[content] !== undefined) {
            logs.push(String(variables[content]));
          } else if (content.includes('int(')) {
            const innerMatch = content.match(/int\((.+?)\)/);
            if (innerMatch && variables[innerMatch[1].trim()] !== undefined) {
              logs.push(String(parseInt(variables[innerMatch[1].trim()], 10)));
            } else {
              throw new Error(`NameError: name '${content}' is not defined`);
            }
          } else {
            let evalExpr = content;
            for (const [k, v] of Object.entries(variables)) {
              evalExpr = evalExpr.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
            }
            if (/^[0-9\s+\-*/()]+$/.test(evalExpr)) {
              logs.push(String(Function(`"use strict"; return (${evalExpr})`)()));
            } else {
              throw new Error(`NameError: name '${content}' is not defined`);
            }
          }
        }
      }
    }
    
    return { success: true, logs, variables };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- SAFE JAVASCRIPT CONSOLE RUNNER ---
const runJSCode = (code) => {
  try {
    let logs = [];
    const sandboxConsole = {
      log: (...args) => {
        logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
      },
      error: (...args) => {
        logs.push("Error: " + args.join(' '));
      },
      warn: (...args) => {
        logs.push("Warning: " + args.join(' '));
      }
    };
    
    const runner = new Function('console', `"use strict"; ${code}`);
    runner(sandboxConsole);
    
    return { success: true, logs };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- SIMULATED TERMINAL/BASH COMMANDS RUNNER ---
const runBashCommand = (command: string): { success: boolean; logs: string[]; error?: string } => {
  const cleanCmd = command.trim().toLowerCase();
  
  if (cleanCmd.includes('docker ps -a')) {
    return {
      success: true,
      logs: [
        "CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS                     PORTS                  NAMES",
        "a1b2c3d4e5f6   nginx          \"/docker-entrypoint.…\"   2 hours ago     Up 2 hours                 0.0.0.0:8080->80/tcp   my-nginx",
        "e9f8d7c6b5a4   postgres:15    \"docker-entrypoint.s…\"   2 hours ago     Exited (0) 5 minutes ago                          postgres-db"
      ]
    };
  }
  
  if (cleanCmd.includes('docker ps')) {
    return {
      success: true,
      logs: [
        "CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                  NAMES",
        "a1b2c3d4e5f6   nginx          \"/docker-entrypoint.…\"   2 hours ago     Up 2 hours     0.0.0.0:8080->80/tcp   my-nginx"
      ]
    };
  }
  
  if (cleanCmd.includes('docker run')) {
    const parts = cleanCmd.split(' ');
    const imageName = parts[parts.length - 1] || 'nginx';
    return {
      success: true,
      logs: [
        `Unable to find image '${imageName}:latest' locally...`,
        `latest: Pulling from library/${imageName}`,
        "c0f52b6267e7: Pulling fs layer",
        "c0f52b6267e7: Download complete",
        `Status: Downloaded newer image for ${imageName}:latest`,
        "d8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0"
      ]
    };
  }
  
  if (cleanCmd.includes('docker images')) {
    return {
      success: true,
      logs: [
        "REPOSITORY   TAG       IMAGE ID       CREATED        SIZE",
        "nginx        latest    a1b2c3d4e5f6   2 days ago     142MB",
        "node         18-alpine e9f8d7c6b5a4   5 days ago     174MB",
        "postgres     15        d8f7e6d5c4b3   2 weeks ago    379MB"
      ]
    };
  }

  if (cleanCmd.includes('docker build')) {
    return {
      success: true,
      logs: [
        "Sending build context to Docker daemon  2.048kB",
        "Step 1/4 : FROM node:18-alpine",
        " ---> e9f8d7c6b5a4",
        "Step 2/4 : WORKDIR /app",
        " ---> Running in 8f7e6d5c",
        " ---> 7a6f5e4d3c2b",
        "Step 3/4 : COPY . .",
        " ---> 5e4d3c2b1a0f",
        "Step 4/4 : CMD [\"node\", \"server.js\"]",
        " ---> Running in 1a0f9e8d",
        " ---> 0d9c8b7a6f5e",
        "Successfully built 0d9c8b7a6f5e",
        "Successfully tagged my-node-app:latest"
      ]
    };
  }

  if (cleanCmd.includes('git status')) {
    return {
      success: true,
      logs: [
        "On branch main",
        "Your branch is up to date with 'origin/main'.",
        "",
        "Changes not staged for commit:",
        "  (use \"git add <file>...\" to update what will be committed)",
        "  (use \"git restore <file>...\" to discard changes in working directory)",
        "\tmodified:   server.js",
        "",
        "no changes added to commit (use \"git add\" and/or \"git commit -a\")"
      ]
    };
  }

  if (cleanCmd.includes('ls')) {
    return {
      success: true,
      logs: [
        "Dockerfile  docker-compose.yml  package.json  server.js  src/"
      ]
    };
  }

  if (cleanCmd.startsWith('echo ')) {
    return {
      success: true,
      logs: [command.trim().substring(5).replace(/['"]/g, '')]
    };
  }

  return {
    success: true,
    logs: [
      `$ ${command}`,
      `Command completed successfully.`
    ]
  };
};

// --- SIMULATED DOCKERFILE BUILDER ---
const runDockerfileBuild = (code) => {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  if (lines.length === 0) {
    return { success: false, error: "Dockerfile is empty!" };
  }
  
  if (!lines[0].toLowerCase().startsWith('from')) {
    return { success: false, error: "Error: Dockerfile must start with 'FROM' instruction." };
  }
  
  let logs = ["Sending build context to Docker daemon  4.12kB"];
  lines.forEach((line, index) => {
    logs.push(`Step ${index + 1}/${lines.length} : ${line}`);
    const hash = Math.random().toString(16).substring(2, 8);
    logs.push(` ---> Running in ${hash}`);
    logs.push(` ---> Removing intermediate container ${hash}`);
    logs.push(` ---> ${Math.random().toString(16).substring(2, 8)}`);
  });
  
  logs.push("Successfully built images");
  logs.push("Successfully tagged app-image:latest");
  
  return { success: true, logs };
};

// --- LIGHTWEIGHT JAVA RUNNER SIMULATOR ---
const runJavaCode = (code) => {
  try {
    let logs = [];
    const matches = code.matchAll(/System\.out\.println\s*\(\s*(.*?)\s*\)\s*;/g);
    for (const match of matches) {
      let content = match[1].trim();
      if (content.startsWith('"') || content.startsWith("'")) {
        logs.push(content.slice(1, -1));
      } else {
        logs.push(content);
      }
    }
    if (logs.length === 0) {
      return { success: true, logs: ["(Compilation successful. No console logs generated.)"] };
    }
    return { success: true, logs };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- MOCK REDIS RUNNER ---
const runRedisCode = (code) => {
  try {
    const logs = [];
    const db = {};
    const lines = code.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;
      
      const parts = line.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      if (parts.length === 0) continue;
      
      const cmd = parts[0].toUpperCase();
      const args = parts.slice(1).map(arg => {
        if (arg.startsWith('"') || arg.startsWith("'")) {
          return arg.slice(1, -1);
        }
        return arg;
      });
      
      if (cmd === 'PING') {
        logs.push('PONG');
      } else if (cmd === 'SET') {
        if (args.length < 2) throw new Error("ERR wrong number of arguments for 'set' command");
        db[args[0]] = args[1];
        logs.push('OK');
      } else if (cmd === 'GET') {
        if (args.length < 1) throw new Error("ERR wrong number of arguments for 'get' command");
        logs.push(db[args[0]] !== undefined ? `"${db[args[0]]}"` : '(nil)');
      } else if (cmd === 'LPUSH') {
        if (args.length < 2) throw new Error("ERR wrong number of arguments for 'lpush' command");
        const listName = args[0];
        if (!db[listName]) db[listName] = [];
        db[listName].unshift(...args.slice(1));
        logs.push(`(integer) ${db[listName].length}`);
      } else if (cmd === 'HSET') {
        if (args.length < 3) throw new Error("ERR wrong number of arguments for 'hset' command");
        const hashName = args[0];
        if (!db[hashName]) db[hashName] = {};
        db[hashName][args[1]] = args[2];
        logs.push('(integer) 1');
      } else if (cmd === 'PUBLISH') {
        if (args.length < 2) throw new Error("ERR wrong number of arguments for 'publish' command");
        logs.push(`(integer) 1`);
      } else if (cmd === 'EXPIRE') {
        if (args.length < 2) throw new Error("ERR wrong number of arguments for 'expire' command");
        logs.push('(integer) 1');
      } else {
        logs.push(`(error) ERR unknown command '${cmd}'`);
      }
    }
    
    return { success: true, logs, variables: db };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- TS STRIPPER & RUNNER ---
const runTypeScriptCode = (code) => {
  try {
    const cleanCode = code
      .replace(/\s+as\s+[a-zA-Z_<>\d[\]]+/g, '')
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
      .replace(/type\s+\w+\s*=\s*[^;]+/g, '')
      .replace(/:\s*(readonly\s+)?([a-zA-Z_<>\d[\]]+(\[\])?)/g, '')
      .replace(/<[a-zA-Z_,\s\d]+>/g, '');

    return runJSCode(cleanCode);
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- MULTI-LANGUAGE GENERAL LOG & VARIABLE EXTRACTORS ---
const extractLogsForLanguage = (code, language) => {
  const logs = [];
  const lang = language.toLowerCase();
  
  if (lang === 'rust') {
    const matches = code.matchAll(/println!\s*\(\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)\s*;/g);
    for (const match of matches) {
      logs.push(match[1]);
    }
  } else if (lang === 'go') {
    const matches = code.matchAll(/fmt\.Println\s*\(\s*"(.*?)"\s*\)/g);
    for (const match of matches) {
      logs.push(match[1]);
    }
    const matches2 = code.matchAll(/println\s*\(\s*"(.*?)"\s*\)/g);
    for (const match of matches2) {
      logs.push(match[1]);
    }
  } else if (lang === 'csharp') {
    const matches = code.matchAll(/Console\.WriteLine\s*\(\s*"(.*?)"\s*\)\s*;/g);
    for (const match of matches) {
      logs.push(match[1]);
    }
  } else if (lang === 'swift') {
    const matches = code.matchAll(/print\s*\(\s*"(.*?)"\s*\)/g);
    for (const match of matches) {
      logs.push(match[1]);
    }
  } else if (lang === 'kotlin') {
    const matches = code.matchAll(/println\s*\(\s*"(.*?)"\s*\)/g);
    for (const match of matches) {
      logs.push(match[1]);
    }
  } else if (lang === 'php') {
    const matches = code.matchAll(/echo\s*"(.*?)"\s*;/g);
    for (const match of matches) {
      logs.push(match[1]);
    }
    const matches2 = code.matchAll(/print\s*"(.*?)"\s*;/g);
    for (const match of matches2) {
      logs.push(match[1]);
    }
  }
  
  return logs;
};

const extractVariablesForLanguage = (code, language) => {
  const variables = {};
  const lang = language.toLowerCase();
  
  const cleanExpr = (expr) => {
    expr = expr.trim();
    if (expr.endsWith(';')) expr = expr.slice(0, -1).trim();
    if (expr.startsWith('"') || expr.startsWith("'")) {
      return expr.slice(1, -1);
    }
    if (!isNaN(expr)) return Number(expr);
    if (expr === 'true' || expr === 'True') return true;
    if (expr === 'false' || expr === 'False') return false;
    return expr;
  };

  const lines = code.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (lang === 'rust') {
      const match = line.match(/^let\s+(?:mut\s+)?([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (match) {
        variables[match[1]] = cleanExpr(match[2]);
      }
    } else if (lang === 'go') {
      const match1 = line.match(/^([a-zA-Z_]\w*)\s*:=\s*(.+)$/);
      if (match1) {
        variables[match1[1]] = cleanExpr(match1[2]);
      }
      const match2 = line.match(/^var\s+([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (match2) {
        variables[match2[1]] = cleanExpr(match2[2]);
      }
    } else if (lang === 'csharp' || lang === 'cpp' || lang === 'java') {
      const match = line.match(/^(?:[a-zA-Z_<>[\]]+\s+)+([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (match) {
        variables[match[1]] = cleanExpr(match[2]);
      }
    } else if (lang === 'swift' || lang === 'kotlin') {
      const match = line.match(/^(?:let|var|val|const)\s+([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (match) {
        variables[match[1]] = cleanExpr(match[2]);
      }
    } else if (lang === 'php') {
      const match = line.match(/^\$([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (match) {
        variables[match[1]] = cleanExpr(match[2]);
      }
    }
  }
  return variables;
};

const runSimulatedLanguage = (code, language) => {
  try {
    const logs = extractLogsForLanguage(code, language);
    const variables = extractVariablesForLanguage(code, language);
    if (logs.length === 0) {
      return { success: true, logs: ["(Compilation successful. No console logs generated.)"], variables };
    }
    return { success: true, logs, variables };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// --- CUSTOM VALIDATORS FOR CURRICULUM REDESIGN ---
const customValidators = {
  // Python 1-1 to 6-4
  'python-1-1': (code, logs, variables) => {
    if (!logs.includes("Welcome to LearnStation, user!")) {
      return { success: false, error: 'Expected console output to contain exactly "Welcome to LearnStation, user!"' };
    }
    return { success: true };
  },
  'python-1-2': (code, logs, variables) => {
    if (variables.max_requests !== 150) {
      return { success: false, error: 'max_requests should be defined as 150' };
    }
    if (variables.is_active !== true) {
      return { success: false, error: 'is_active should be defined as True' };
    }
    return { success: true };
  },
  'python-1-3': (code, logs, variables) => {
    if (variables.remaining_items !== 3) {
      return { success: false, error: 'remaining_items should be 3 (103 % 10)' };
    }
    if (!code.includes('%')) {
      return { success: false, error: 'Must use the modulus operator (%) to calculate remaining items' };
    }
    return { success: true };
  },
  'python-1-4': (code, logs, variables) => {
    if (Math.abs((variables.total_cost || 0) - 149.97) > 0.01) {
      return { success: false, error: 'total_cost should be 149.97' };
    }
    if (!code.includes('float') || !code.includes('int')) {
      return { success: false, error: 'Must cast price_str using float() and qty_str using int()' };
    }
    return { success: true };
  },
  'python-2-1': (code, logs, variables) => {
    if (!code.includes('if') || !code.includes('cart_total')) {
      return { success: false, error: 'Must write an if statement checking cart_total' };
    }
    if (!/free_shipping\s*=\s*True/.test(code)) {
      return { success: false, error: 'Must set free_shipping = True inside the conditional' };
    }
    return { success: true };
  },
  'python-2-2': (code, logs, variables) => {
    if (!code.includes('if') || !code.includes('elif') || !code.includes('else')) {
      return { success: false, error: 'Must use an if-elif-else logical structure' };
    }
    if (!/discount\s*=\s*0\.2/.test(code) || !/discount\s*=\s*0\.1/.test(code) || !/discount\s*=\s*0/.test(code)) {
      return { success: false, error: 'Must set the correct discount values (0.2, 0.1, and 0) for each months tier' };
    }
    return { success: true };
  },
  'python-2-3': (code, logs, variables) => {
    if (!code.includes('while')) {
      return { success: false, error: 'Must implement a while loop' };
    }
    if (!code.includes('attempts') || !code.includes('max_attempts')) {
      return { success: false, error: 'Loop condition must check attempts against max_attempts' };
    }
    if (!/attempts\s*(\+=\s*1|=\s*attempts\s*\+\s*1)/.test(code)) {
      return { success: false, error: 'Must increment attempts inside the loop to avoid an infinite loop' };
    }
    return { success: true };
  },
  'python-2-4': (code, logs, variables) => {
    if (!code.includes('for') || !code.includes('range(5)')) {
      return { success: false, error: 'Must loop exactly 5 times using range(5)' };
    }
    if (!code.includes('.append(')) {
      return { success: false, error: 'Must append server alerts to the servers list' };
    }
    return { success: true };
  },
  'python-3-1': (code, logs, variables) => {
    if (!code.includes('lobby.append') || !code.includes('Dave')) {
      return { success: false, error: 'Must append "Dave" to the lobby list' };
    }
    if (!code.includes('lobby.remove') || !code.includes('Alice')) {
      return { success: false, error: 'Must remove "Alice" from the lobby list' };
    }
    return { success: true };
  },
  'python-3-2': (code, logs, variables) => {
    if (!/top_three\s*=\s*transactions\[\s*\d*\s*:\s*\d*\s*\]/.test(code)) {
      return { success: false, error: 'Must assign top_three using a slice of the transactions list' };
    }
    if (!code.includes('[:3]') && !code.includes('[0:3]')) {
      return { success: false, error: 'Slice must extract the first 3 items (e.g. transactions[0:3] or transactions[:3])' };
    }
    return { success: true };
  },
  'python-3-3': (code, logs, variables) => {
    if (!/profile\[\s*["']status["']\s*\]\s*=\s*["']active["']/.test(code)) {
      return { success: false, error: 'Must update the "status" key to "active"' };
    }
    if (!/profile\[\s*["']role["']\s*\]\s*=\s*["']developer["']/.test(code)) {
      return { success: false, error: 'Must insert the "role" key with value "developer"' };
    }
    return { success: true };
  },
  'python-3-4': (code, logs, variables) => {
    if (!/unique_ips\s*=\s*set\(raw_ips\)/.test(code)) {
      return { success: false, error: 'Must convert raw_ips to set and assign to unique_ips' };
    }
    return { success: true };
  },
  'python-4-1': (code, logs, variables) => {
    if (!/def\s+calculate_discount\(\s*price\s*,\s*pct\s*\)/.test(code)) {
      return { success: false, error: 'Must define function calculate_discount with price and pct parameters' };
    }
    if (!code.includes('return')) {
      return { success: false, error: 'Function must return the calculated subtotal price' };
    }
    return { success: true };
  },
  'python-4-2': (code, logs, variables) => {
    if (!/def\s+create_response\(\s*status\s*,\s*code\s*\)/.test(code)) {
      return { success: false, error: 'Must define function create_response with status and code parameters' };
    }
    if (!code.includes('return') || !code.includes('status') || !code.includes('code')) {
      return { success: false, error: 'Function must return a dictionary containing status and code keys' };
    }
    return { success: true };
  },
  'python-4-3': (code, logs, variables) => {
    if (!/def\s+notify\(\s*message\s*,\s*channel\s*=\s*["']email["']\s*\)/.test(code)) {
      return { success: false, error: 'Must define channel parameter with a default value of "email"' };
    }
    return { success: true };
  },
  'python-4-4': (code, logs, variables) => {
    if (!code.includes('global') || !code.includes('event_count')) {
      return { success: false, error: 'Must declare event_count as global to modify it inside the function scope' };
    }
    return { success: true };
  },
  'python-5-1': (code, logs, variables) => {
    if (!/with\s+open\(\s*["']config\.json["']\s*,\s*["']r["']\s*\)\s+as/.test(code)) {
      return { success: false, error: 'Must open config.json in read ("r") mode using a with statement context manager' };
    }
    return { success: true };
  },
  'python-5-2': (code, logs, variables) => {
    if (!/with\s+open\(\s*["']server\.log["']\s*,\s*["']w["']\s*\)\s+as/.test(code)) {
      return { success: false, error: 'Must open server.log in write ("w") mode using a with statement context manager' };
    }
    return { success: true };
  },
  'python-5-3': (code, logs, variables) => {
    if (!code.includes('try') || !code.includes('except ValueError:')) {
      return { success: false, error: 'Must wrap the integer conversion in a try-except block handling ValueError' };
    }
    return { success: true };
  },
  'python-5-4': (code, logs, variables) => {
    if (!code.includes('try') || !code.includes('finally')) {
      return { success: false, error: 'Must implement a try-finally structure' };
    }
    if (!code.includes('.close()')) {
      return { success: false, error: 'Must call stream.close() inside the finally block to release memory' };
    }
    return { success: true };
  },
  'python-6-1': (code, logs, variables) => {
    if (!/class\s+Product\s*:/.test(code)) {
      return { success: false, error: 'Must define a Product class using class Product:' };
    }
    return { success: true };
  },
  'python-6-2': (code, logs, variables) => {
    if (!/def\s+__init__\(\s*self\s*,\s*username\s*,\s*email\s*\)/.test(code)) {
      return { success: false, error: 'Must define constructor method __init__ with self, username, and email parameters' };
    }
    if (!code.includes('self.username') || !code.includes('self.email')) {
      return { success: false, error: 'Constructor must initialize self.username and self.email attributes' };
    }
    return { success: true };
  },
  'python-6-3': (code, logs, variables) => {
    if (!/class\s+Manager\(\s*Employee\s*\)\s*:/.test(code)) {
      return { success: false, error: 'Manager must inherit from Employee using subclassing syntax' };
    }
    return { success: true };
  },
  'python-6-4': (code, logs, variables) => {
    if (!/def\s+calculate_interest\(\s*self\s*\)/.test(code)) {
      return { success: false, error: 'Must override calculate_interest method with correct parameters' };
    }
    return { success: true };
  },

  // Java 1-1 to 6-4
  'java-1-1': (code, logs, variables) => {
    if (!code.includes('System.out.println("SaaS Online");') && !code.includes("System.out.println('SaaS Online');")) {
      return { success: false, error: 'Must print exactly "SaaS Online" to the console' };
    }
    return { success: true };
  },
  'java-1-2': (code, logs, variables) => {
    if (!/double\s+subscriptionPrice\s*=\s*49\.99/.test(code)) {
      return { success: false, error: 'Must declare double subscriptionPrice set to 49.99' };
    }
    if (!/int\s+userCount\s*=\s*25/.test(code)) {
      return { success: false, error: 'Must declare int userCount set to 25' };
    }
    return { success: true };
  },
  'java-1-3': (code, logs, variables) => {
    if (!/int\s+remainingItems\s*=\s*items\s*%\s*users/.test(code)) {
      return { success: false, error: 'Must calculate remainingItems using the modulus operator (%)' };
    }
    return { success: true };
  },
  'java-1-4': (code, logs, variables) => {
    if (!code.includes('email.toLowerCase()')) {
      return { success: false, error: 'Must call email.toLowerCase() to convert the string' };
    }
    return { success: true };
  },
  'java-2-1': (code, logs, variables) => {
    if (!code.includes('if') || !code.includes('cartTotal >= 50')) {
      return { success: false, error: 'Must write an if statement checking if cartTotal is greater than or equal to 50' };
    }
    if (!code.includes('freeShipping = true')) {
      return { success: false, error: 'Must assign freeShipping to true inside the condition block' };
    }
    return { success: true };
  },
  'java-2-2': (code, logs, variables) => {
    if (!code.includes('switch') || !code.includes('case 1') || !code.includes('case 2')) {
      return { success: false, error: 'Must implement switch-case conditions for tier selections' };
    }
    return { success: true };
  },
  'java-2-3': (code, logs, variables) => {
    if (!/for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*5\s*;\s*i\s*\+\+\s*\)/.test(code)) {
      return { success: false, error: 'Must write a for loop iterating from index 0 to 4' };
    }
    return { success: true };
  },
  'java-2-4': (code, logs, variables) => {
    if (!code.includes('while') || !code.includes('attempts < maxAttempts')) {
      return { success: false, error: 'Must write a while loop checking attempts against maxAttempts' };
    }
    if (!code.includes('attempts++') && !code.includes('attempts = attempts + 1')) {
      return { success: false, error: 'Must increment attempts inside the loop body' };
    }
    return { success: true };
  },
  'java-3-1': (code, logs, variables) => {
    if (!/int\s*\[\s*\]\s*ports\s*=\s*\{\s*80\s*,\s*443\s*,\s*8080\s*\}/.test(code) && !/int\s+ports\s*\[\s*\]\s*=\s*\{\s*80\s*,\s*443\s*,\s*8080\s*\}/.test(code)) {
      return { success: false, error: 'Must define an int array named ports initialized with 80, 443, and 8080' };
    }
    return { success: true };
  },
  'java-3-2': (code, logs, variables) => {
    if (!/public\s+static\s+double\s+calculateDiscount\(\s*double\s+price\s*,\s*double\s+pct\s*\)/.test(code)) {
      return { success: false, error: 'Must declare public static double calculateDiscount method with double parameters' };
    }
    return { success: true };
  },
  'java-3-3': (code, logs, variables) => {
    if (!code.includes('return')) {
      return { success: false, error: 'Method must contain a return statement outputting the status string' };
    }
    return { success: true };
  },
  'java-3-4': (code, logs, variables) => {
    if (!/public\s+static\s+void\s+logMessage\(\s*String\s+message\s*,\s*int\s+level\s*\)/.test(code)) {
      return { success: false, error: 'Must define public static void logMessage with String message and int level parameters' };
    }
    return { success: true };
  },
  'java-4-1': (code, logs, variables) => {
    if (!code.includes('class Product') || !code.includes('new Product(')) {
      return { success: false, error: 'Must declare Product class and instantiate it using new Product()' };
    }
    return { success: true };
  },
  'java-4-2': (code, logs, variables) => {
    if (!code.includes('private String email') || !code.includes('getEmail()') || !code.includes('setEmail(')) {
      return { success: false, error: 'Must encapsulate the email field using a private modifier and supply getters/setters' };
    }
    return { success: true };
  },
  'java-4-3': (code, logs, variables) => {
    if (!/public\s+Customer\(\s*String\s+name\s*,\s*String\s+email\s*\)/.test(code)) {
      return { success: false, error: 'Must define a Customer constructor accepting String name and String email' };
    }
    if (!code.includes('this.name = name') || !code.includes('this.email = email')) {
      return { success: false, error: 'Constructor must assign parameters to instance fields using this' };
    }
    return { success: true };
  },
  'java-4-4': (code, logs, variables) => {
    if (!/public\s+static\s+int\s+activeConnections/.test(code)) {
      return { success: false, error: 'Must define public static int activeConnections variable' };
    }
    return { success: true };
  },
  'java-5-1': (code, logs, variables) => {
    if (!code.includes('class Manager extends Employee')) {
      return { success: false, error: 'Manager class must extend Employee' };
    }
    return { success: true };
  },
  'java-5-2': (code, logs, variables) => {
    if (!code.includes('super(name, salary);')) {
      return { success: false, error: 'Must call super(name, salary) as the first statement in the Manager constructor' };
    }
    return { success: true };
  },
  'java-5-3': (code, logs, variables) => {
    if (!code.includes('@Override') || !/public\s+void\s+speak\(\s*\)/.test(code)) {
      return { success: false, error: 'Must annotate the overridden speak() method with @Override' };
    }
    return { success: true };
  },
  'java-5-4': (code, logs, variables) => {
    if (!code.includes('interface Loggable') || !code.includes('implements Loggable')) {
      return { success: false, error: 'Must define the Loggable interface and implement it on the ConsoleLogger class' };
    }
    return { success: true };
  },
  'java-6-1': (code, logs, variables) => {
    if (!code.includes('ArrayList<String>') || !code.includes('.add(')) {
      return { success: false, error: 'Must initialize ArrayList and add elements using .add()' };
    }
    return { success: true };
  },
  'java-6-2': (code, logs, variables) => {
    if (!code.includes('HashMap<String, String>') || !code.includes('.put(')) {
      return { success: false, error: 'Must initialize HashMap and insert key-value mappings using .put()' };
    }
    return { success: true };
  },
  'java-6-3': (code, logs, variables) => {
    if (!code.includes('try') || !code.includes('catch')) {
      return { success: false, error: 'Must wrap division code in a try-catch block handling ArithmeticException' };
    }
    return { success: true };
  },
  'java-6-4': (code, logs, variables) => {
    if (!code.includes('extends Exception')) {
      return { success: false, error: 'Custom exception InsufficientFundsException must extend the Exception class' };
    }
    return { success: true };
  },

  // Web Dev JavaScript lessons (webdev-5-1 to 6-4)
  'webdev-5-1': (code, logs, variables) => {
    if (!/const\s+maxRequests\s*=\s*100/.test(code)) {
      return { success: false, error: 'Must declare const maxRequests initialized to 100' };
    }
    if (!/let\s+currentRequests\s*=\s*0/.test(code)) {
      return { success: false, error: 'Must declare let currentRequests initialized to 0' };
    }
    return { success: true };
  },
  'webdev-5-2': (code, logs, variables) => {
    if (!code.includes('addEventListener') || !/['"]click['"]/.test(code)) {
      return { success: false, error: 'Must register a click event listener on the btn element' };
    }
    return { success: true };
  },
  'webdev-5-3': (code, logs, variables) => {
    if (!code.includes('document.querySelector') || !/['"]\.card['"]/.test(code)) {
      return { success: false, error: 'Must select the card element using document.querySelector(".card")' };
    }
    return { success: true };
  },
  'webdev-5-4': (code, logs, variables) => {
    if (!code.includes('.textContent') || !code.includes('Success')) {
      return { success: false, error: 'Must assign the textContent property of el to "Success"' };
    }
    return { success: true };
  },
  'webdev-6-1': (code, logs, variables) => {
    if (!code.includes('document.createElement') || !/['"]div['"]/.test(code)) {
      return { success: false, error: 'Must create a div element using document.createElement("div")' };
    }
    if (!code.includes('appendChild')) {
      return { success: false, error: 'Must append the new div element to the document.body' };
    }
    return { success: true };
  },
  'webdev-6-2': (code, logs, variables) => {
    if (!code.includes('classList.add') || !/['"]active['"]/.test(code)) {
      return { success: false, error: 'Must add the class "active" using classList.add("active")' };
    }
    return { success: true };
  },
  'webdev-6-3': (code, logs, variables) => {
    if (!code.includes('new Promise') || !code.includes('resolve')) {
      return { success: false, error: 'Must instantiate a Promise resolving with the value "Completed"' };
    }
    return { success: true };
  },
  'webdev-6-4': (code, logs, variables) => {
    if (!code.includes('fetch') || !/['"]https:\/\/api\.example\.com\/data['"]/.test(code)) {
      return { success: false, error: 'Must fetch from endpoint "https://api.example.com/data"' };
    }
    return { success: true };
  }
};

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const highlightCode = (code: string, language: string) => {
  if (!code) return '';
  const lang = (language || '').toLowerCase();
  
  let rules: { type: string; regex: RegExp; format?: (m: string) => string }[] = [];
  if (lang === 'python') {
    rules = [
      { type: 'comment', regex: /#[^\n]*/y },
      { type: 'string', regex: /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|f"(?:\\.|[^"\\])*"|f'(?:\\.|[^'\\])*'/y },
      { type: 'keyword', regex: /\b(?:def|class|if|elif|else|while|for|in|return|import|from|as|global|try|except|finally|with|and|or|not|is|None|True|False|pass|lambda|assert|break|continue|yield)\b/y },
      { type: 'class', regex: /\b[A-Z]\w*\b/y },
      { type: 'function', regex: /\b\w+(?=\s*\()/y },
      { type: 'number', regex: /\b\d+(?:\.\d+)?\b/y },
      { type: 'variable', regex: /\b[a-z_]\w*\b/y }
    ];
  } else if (lang === 'html') {
    rules = [
      { type: 'comment', regex: /<!--[\s\S]*?-->/y },
      { type: 'tag', regex: /<\/?[a-zA-Z0-9:-]+/y },
      { type: 'tag', regex: />/y },
      { type: 'value', regex: /=\s*"(?:\\.|[^"\\])*"|=\s*'(?:\\.|[^'\\])*'/y },
      { type: 'attribute', regex: /\b[a-zA-Z0-9:-]+(?=\s*=)/y }
    ];
  } else if (lang === 'css') {
    rules = [
      { type: 'comment', regex: /\/\*[\s\S]*?\*\//y },
      { type: 'selector', regex: /\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+|\b(?:body|html|div|span|p|a|h1|h2|h3|h4|h5|h6|ul|li|ol|table|tr|td|th|input|button|textarea|section|main|header|footer)\b/y },
      { type: 'property', regex: /\b[a-zA-Z-]+\s*(?=:)/y },
      {
        type: 'css-value-clause',
        regex: /:\s*([^;}\n]+)/y,
        format: (match) => {
          return `:<span class="hl-value">${escapeHtml(match.substring(1))}</span>`;
        }
      },
      { type: 'bracket', regex: /[{}]/y }
    ];
  } else if (lang === 'sql') {
    rules = [
      { type: 'comment', regex: /--[^\n]*|\/\*[\s\S]*?\*\//y },
      { type: 'string', regex: /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/y },
      { type: 'keyword', regex: /\b(?:select|from|where|order\s+by|group\s+by|limit|insert\s+into|values|update|set|delete|join|left|right|inner|outer|on|and|or|not|null|true|false|create\s+table|database|primary\s+key|foreign\s+key|references|alter|drop|index|like|in|as|is|having|count|sum|avg|min|max)\b/iy },
      {
        type: 'table-clause',
        regex: /(?:from|join|update|into|table)\s+([a-zA-Z_]\w*)\b/iy,
        format: (match) => {
          const parts = match.split(/(\s+)/);
          const keyword = parts[0];
          const space = parts[1] || '';
          const table = parts[2] || '';
          return `<span class="hl-keyword">${escapeHtml(keyword)}</span>${escapeHtml(space)}<span class="hl-table">${escapeHtml(table)}</span>`;
        }
      },
      { type: 'table', regex: /\b(?:users|products|orders)\b/iy },
      { type: 'number', regex: /\b\d+(?:\.\d+)?\b/y }
    ];
  } else if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
    rules = [
      { type: 'comment', regex: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
      { type: 'string', regex: /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y },
      { type: 'keyword', regex: /\b(?:const|let|var|function|class|if|else|switch|case|default|for|while|do|break|continue|return|try|catch|finally|throw|new|this|typeof|instanceof|import|export|from|extends|super|async|await|yield|null|undefined|true|false|of|in)\b/y },
      { type: 'function', regex: /\b\w+(?=\s*\()/y },
      { type: 'number', regex: /\b\d+(?:\.\d+)?\b/y },
      { type: 'variable', regex: /\b[a-zA-Z_]\w*\b/y }
    ];
  } else if (lang === 'java') {
    rules = [
      { type: 'comment', regex: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
      { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y },
      { type: 'keyword', regex: /\b(?:public|private|protected|class|interface|extends|implements|static|void|int|double|float|boolean|char|long|short|byte|new|this|super|return|if|else|switch|case|break|continue|for|while|do|try|catch|finally|throw|throws|import|package|null|true|false)\b/y },
      { type: 'class', regex: /\b[A-Z]\w*\b/y },
      { type: 'function', regex: /\b\w+(?=\s*\()/y },
      { type: 'number', regex: /\b\d+(?:\.\d+)?\b/y }
    ];
  } else {
    rules = [
      { type: 'comment', regex: /<!--[\s\S]*?-->|\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*/y },
      { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y },
      { type: 'keyword', regex: /\b(?:class|id|style|href|src|div|span|p|a|h1|h2|h3|h4|h5|h6|body|html|head|meta|link|script|const|let|var|function|return|if|else|docker|git|npm|run|exec|ps|images)\b/iy },
      { type: 'number', regex: /\b\d+(?:\.\d+)?\b/y }
    ];
  }

  let html = '';
  let i = 0;
  const len = code.length;

  while (i < len) {
    let matched = false;
    for (const rule of rules) {
      rule.regex.lastIndex = i;
      const match = rule.regex.exec(code);
      if (match && match.index === i) {
        const text = match[0];
        if (rule.format) {
          html += rule.format(text);
        } else {
          html += `<span class="hl-${rule.type}">${escapeHtml(text)}</span>`;
        }
        i += text.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      html += escapeHtml(code[i]);
      i++;
    }
  }
  return html;
};

const isFoldableLine = (lineText: string, lang: string) => {
  const trimmed = lineText.trim();
  if (!trimmed) return false;
  const l = (lang || '').toLowerCase();
  
  if (trimmed.endsWith('{') || trimmed.endsWith(':')) return true;
  
  if (l === 'python') {
    return trimmed.startsWith('def ') || trimmed.startsWith('class ');
  }
  if (l === 'javascript' || l === 'js' || l === 'typescript' || l === 'ts') {
    return trimmed.startsWith('function ') || trimmed.startsWith('class ') || (trimmed.startsWith('const ') && trimmed.includes('=>'));
  }
  if (l === 'java') {
    return trimmed.includes('class ') || trimmed.includes('interface ') || ((trimmed.includes('public ') || trimmed.includes('private ')) && trimmed.includes('('));
  }
  return false;
};

export default function InteractivePlayground({ language, template, instruction, answer, onCorrect, slug }: {
  language: string;
  template: string;
  instruction: string;
  answer: string;
  onCorrect?: () => void;
  slug?: string;
}) {
  const [code, setCode] = useState('');
  const [zoom, setZoom] = useState(14);
  const [splitWidth, setSplitWidth] = useState(40);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-light' | 'vs-dark'>('vs-light');

  // Tabs
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'generator' | 'analytics'>('description');
  const [outputTab, setOutputTab] = useState<'output' | 'testcases' | 'review'>('output');

  // Execution outputs
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [running, setRunning] = useState(false);
  const [verified, setVerified] = useState(false);

  // AI Practice Generator
  const [practiceDifficulty, setPracticeDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [practiceType, setPracticeType] = useState<string>('code-writing');
  const [practiceChallenge, setPracticeChallenge] = useState<any>(null);
  const [generatingChallenge, setGeneratingChallenge] = useState(false);
  const [validatingSolution, setValidatingSolution] = useState(false);
  
  // Hint reveal state
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [testCasesResults, setTestCasesResults] = useState<any[]>([]);
  const [aiReview, setAiReview] = useState<string>('');
  
  // Analytics
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | ''>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeout = useRef<any>(null);

  // Synchronize theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark-theme') || 
                   document.body.classList.contains('dark-mode') ||
                   localStorage.getItem('theme') === 'dark';
    setEditorTheme(isDark ? 'vs-dark' : 'vs-light');
  }, []);

  // Reset timer on load
  useEffect(() => {
    setStartTime(Date.now());
  }, [slug, practiceChallenge]);

  // Load from template
  useEffect(() => {
    if (template) {
      const cleanTemplate = template.replace(/___/g, '');
      setCode(cleanTemplate || '');
    } else {
      setCode('');
    }
    setSqlResult(null);
    setConsoleLogs([]);
    setErrors('');
    setSuccessMsg('');
    setVerified(false);
    setRevealedHints(0);
    setTestCasesResults([]);
    setAiReview('');
  }, [template]);

  // Load analytics
  const fetchAnalytics = async () => {
    try {
      const data = await progressService.getCodingAnalytics();
      setAnalyticsData(data.analytics);
    } catch (err) {
      console.error('Failed to load coding analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const lang = (practiceChallenge ? practiceChallenge.language : language)?.toLowerCase() || 'javascript';
  const isSql = lang === 'sql';
  const isPython = lang === 'python';
  const isWeb = ['html', 'css'].includes(lang);
  const isJs = ['javascript', 'js'].includes(lang);
  const isBash = lang === 'bash' || lang === 'sh';
  const isDockerfile = lang === 'dockerfile';
  const isJava = lang === 'java';

  // Local compilation runner
  const handleRun = () => {
    setErrors('');
    setSqlResult(null);
    setConsoleLogs([]);
    setSuccessMsg('');
    setRunning(true);
    setOutputTab('output');

    setTimeout(() => {
      setRunning(false);
      if (isSql) {
        const res = runSQLQuery(code);
        if (res.success) {
          setSqlResult(res.rows);
        } else {
          setErrors(res.error);
        }
      } else if (isPython) {
        const res = runPythonCode(code);
        if (res.success) {
          setConsoleLogs(res.logs);
        } else {
          setErrors(res.error);
        }
      } else if (isJs || lang === 'typescript' || lang === 'ts') {
        const res = (lang === 'typescript' || lang === 'ts') ? runTypeScriptCode(code) : runJSCode(code);
        if (res.success) {
          setConsoleLogs(res.logs);
        } else {
          setErrors(res.error);
        }
      } else if (lang === 'redis') {
        const res = runRedisCode(code);
        if (res.success) {
          setConsoleLogs(res.logs);
        } else {
          setErrors(res.error);
        }
      } else if (['rust', 'go', 'csharp', 'swift', 'kotlin', 'php', 'cpp'].includes(lang)) {
        const res = runSimulatedLanguage(code, lang);
        if (res.success) {
          setConsoleLogs(res.logs);
        } else {
          setErrors(res.error);
        }
      } else if (isBash) {
        const res = runBashCommand(code);
        if (res.success) {
          setConsoleLogs(res.logs);
        } else {
          setErrors(res.error);
        }
      } else if (isDockerfile) {
        const res = runDockerfileBuild(code);
        if (res.success) {
          setConsoleLogs(res.logs);
        } else {
          setErrors(res.error);
        }
      } else if (isJava) {
        const res = runJavaCode(code);
        if (res.success) {
          setConsoleLogs(res.logs);
        } else {
          setErrors(res.error);
        }
      }
    }, 400);
  };

  // Submit / AI Validation Check
  const handleVerify = async () => {
    setErrors('');
    setSuccessMsg('');
    setValidatingSolution(true);
    setOutputTab('output');

    const userCode = code.trim();

    // 1. Lesson Mode: if slug has a custom validator
    if (slug && customValidators[slug]) {
      let runRes: any = { success: true, logs: [], variables: {} };
      if (isPython) {
        runRes = runPythonCode(userCode);
      } else if (isJs || lang === 'typescript' || lang === 'ts') {
        runRes = (lang === 'typescript' || lang === 'ts') ? runTypeScriptCode(userCode) : runJSCode(userCode);
      } else if (isJava) {
        runRes = runJavaCode(userCode);
      } else if (lang === 'redis') {
        runRes = runRedisCode(userCode);
      } else if (['rust', 'go', 'csharp', 'swift', 'kotlin', 'php', 'cpp'].includes(lang)) {
        runRes = runSimulatedLanguage(userCode, lang);
      }
      
      const valRes = customValidators[slug](userCode, runRes.logs || [], runRes.variables || {});
      if (valRes.success) {
        if (!isWeb) {
          setConsoleLogs(runRes.logs || []);
        }
        setSuccessMsg('Perfect! Challenge resolved successfully.');
        setVerified(true);
        if (onCorrect) onCorrect();
      } else {
        setErrors(valRes.error || 'Validation failed. Double check your implementation.');
      }
      setValidatingSolution(false);
      return;
    }

    // 2. AI Practice Generator Mode or Standard validation fallback
    try {
      const activeChallenge = practiceChallenge || {
        scenario: "Write code to satisfy the lesson challenge requirements.",
        objective: instruction || "Complete the practice exercise.",
        starter_code: template || "",
        expected_output: answer || "",
        xp_reward: 20
      };

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const res = await progressService.validatePracticeSolution({
        code: userCode,
        language: lang,
        challenge: activeChallenge,
        timeSpent: elapsed
      });

      if (res.success) {
        setSuccessMsg(`Congratulations! Solved successfully. +${res.xpEarned} XP awarded.`);
        setVerified(true);
        if (onCorrect) onCorrect();
        fetchAnalytics();
      } else {
        setErrors('AI Review: Challenge requirements not fully satisfied. Check review logs.');
      }

      setTestCasesResults(res.testCasesResults || []);
      setAiReview(res.feedback || '');
      setOutputTab('review');
    } catch (err: any) {
      console.error(err);
      setErrors(err.response?.data?.message || 'Failed to validate solution.');
    } finally {
      setValidatingSolution(false);
    }
  };

  // Generate Unlimited Practice
  const handleGeneratePractice = async () => {
    setGeneratingChallenge(true);
    setErrors('');
    setSuccessMsg('');
    setPracticeChallenge(null);

    try {
      // Find active track id from routing parameters or track variables
      const trackId = localStorage.getItem('active_track_id') || 'd5f778a8-b649-411a-8bb7-f1cbe2d3db70'; // Fallback to a valid track uuid
      const res = await progressService.generatePracticeChallenge(trackId, practiceDifficulty, practiceType);
      
      if (res && res.challenge) {
        setPracticeChallenge(res.challenge);
        setCode(res.challenge.starter_code || '');
        setRevealedHints(0);
        setTestCasesResults([]);
        setAiReview('');
        setActiveTab('description');
        setStartTime(Date.now());
      }
    } catch (err: any) {
      console.error(err);
      setErrors(err.response?.data?.message || 'Failed to generate practice challenge.');
    } finally {
      setGeneratingChallenge(false);
    }
  };

  // Auto save & History Logger
  const handleCodeChange = (newVal: string | undefined) => {
    const val = newVal || '';
    setCode(val);
    
    if (slug) {
      localStorage.setItem(`playground_history_${slug}`, val);
    } else if (practiceChallenge) {
      localStorage.setItem(`playground_history_practice`, val);
    }

    setSaveStatus('Saving...');
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  // Drag resizer
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        setSplitWidth(Math.max(25, Math.min(75, newWidth)));
      }
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setSuccessMsg('Code copied to clipboard!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Download Code
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learnstation_code.${lang === 'python' ? 'py' : lang === 'sql' ? 'sql' : 'js'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut config
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`ide-wrapper ${isFullscreen ? 'ide-wrapper--fullscreen' : ''}`}
      style={{
        display: 'flex',
        width: '100%',
        height: isFullscreen ? '100vh' : '680px',
        border: '1px solid var(--border)',
        borderRadius: isFullscreen ? '0' : '20px',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? '0' : 'auto',
        left: isFullscreen ? '0' : 'auto',
        zIndex: isFullscreen ? '9999' : '1'
      }}
    >
      {/* 1. LEFT SIDEBAR: Instructions, progressive hints, AI generators, analytics */}
      <div 
        style={{ 
          width: `${splitWidth}%`, 
          display: 'flex', 
          flexDirection: 'column', 
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}
      >
        {/* Sidebar tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
          <button 
            onClick={() => setActiveTab('description')}
            style={{
              flex: 1, padding: '12px 6px', fontSize: '11px', fontWeight: 600, border: 'none', background: 'transparent',
              color: activeTab === 'description' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'description' ? '2px solid var(--accent-blue)' : 'none', cursor: 'pointer'
            }}
          >
            📋 Description
          </button>
          <button 
            onClick={() => setActiveTab('hints')}
            style={{
              flex: 1, padding: '12px 6px', fontSize: '11px', fontWeight: 600, border: 'none', background: 'transparent',
              color: activeTab === 'hints' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'hints' ? '2px solid var(--accent-blue)' : 'none', cursor: 'pointer'
            }}
          >
            💡 Hints {(revealedHints > 0) && `(${revealedHints}/4)`}
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            style={{
              flex: 1, padding: '12px 6px', fontSize: '11px', fontWeight: 600, border: 'none', background: 'transparent',
              color: activeTab === 'generator' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'generator' ? '2px solid var(--accent-blue)' : 'none', cursor: 'pointer'
            }}
          >
            ⚡ Practice Gen
          </button>
          <button 
            onClick={() => {
              setActiveTab('analytics');
              fetchAnalytics();
            }}
            style={{
              flex: 1, padding: '12px 6px', fontSize: '11px', fontWeight: 600, border: 'none', background: 'transparent',
              color: activeTab === 'analytics' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-blue)' : 'none', cursor: 'pointer'
            }}
          >
            📊 Analytics
          </button>
        </div>

        {/* Sidebar panels content */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TAB 1: Description */}
          {activeTab === 'description' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {practiceChallenge ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge--${practiceChallenge.difficulty}`} style={{ textTransform: 'capitalize' }}>
                      {practiceChallenge.difficulty}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-amber)', fontWeight: 600 }}>
                      ✦ {practiceChallenge.xp_reward} XP
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Real-World Scenario</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {practiceChallenge.scenario}
                  </p>

                  <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Objective</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {practiceChallenge.objective}
                  </p>

                  {practiceChallenge.requirements && (
                    <>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Requirements</h4>
                      <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {practiceChallenge.requirements.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {practiceChallenge.constraints && (
                    <>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Constraints</h4>
                      <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {practiceChallenge.constraints.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {practiceChallenge.expected_output && (
                    <>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Expected Output</h4>
                      <pre style={{ background: '#1e1e1e', color: '#abb2bf', padding: '10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
                        {practiceChallenge.expected_output}
                      </pre>
                    </>
                  )}
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Lesson Objectives</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {instruction}
                  </p>
                  {answer && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                      <strong style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Expected Solution Output</strong>
                      <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{answer}</code>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: Hints */}
          {activeTab === 'hints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Progressive Hints</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Level {revealedHints} of 4</span>
              </div>

              {/* Hint Blocks */}
              {Array.from({ length: 4 }).map((_, i) => {
                const hintNum = i + 1;
                const isRevealed = revealedHints >= hintNum;
                return (
                  <div 
                    key={i}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '16px',
                      background: isRevealed ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                      opacity: isRevealed ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '12px', color: isRevealed ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                        Hint {hintNum}: {hintNum === 1 ? 'Concept clue' : hintNum === 2 ? 'Logic structure' : hintNum === 3 ? 'Pseudo-code' : 'Reference solution'}
                      </strong>
                      {!isRevealed && hintNum === revealedHints + 1 && (
                        <button 
                          onClick={() => setRevealedHints(hintNum)}
                          className="btn btn--secondary btn--xs"
                        >
                          Reveal Hint
                        </button>
                      )}
                    </div>

                    {isRevealed && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', fontFamily: hintNum === 4 ? 'var(--font-mono)' : 'inherit' }}>
                        {practiceChallenge?.hints?.[i] || (
                          i === 0 ? "Check your syntax rules carefully." :
                          i === 1 ? "Think about the order of statements." :
                          i === 2 ? "Write loops to process records one-by-one." :
                          `Reference answer: ${answer}`
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Unlimited Practice Generator */}
          {activeTab === 'generator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Unlimited AI Practice Generator</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Generate unlimited, randomized software engineering challenges tailored to this track's primary language.
              </p>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Choose Difficulty</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['easy', 'medium', 'hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setPracticeDifficulty(d as any)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer',
                        fontSize: '11px', textTransform: 'capitalize',
                        background: practiceDifficulty === d ? 'var(--accent-blue)' : 'var(--bg-primary)',
                        color: practiceDifficulty === d ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Challenge Format</label>
                <select
                  value={practiceType}
                  onChange={e => setPracticeType(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px'
                  }}
                >
                  <option value="code-writing">Code Writing</option>
                  <option value="debugging">Debugging Practice</option>
                  <option value="complete-code">Complete the Code</option>
                  <option value="optimization">Performance Optimization</option>
                  <option value="refactoring">Code Refactoring</option>
                </select>
              </div>

              <button
                onClick={handleGeneratePractice}
                disabled={generatingChallenge}
                className="btn btn--primary btn--md"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)',
                  color: 'white', marginTop: '12px'
                }}
              >
                {generatingChallenge ? 'Generating with AI...' : '🚀 Generate Custom Challenge'}
              </button>

              {practiceChallenge && (
                <button
                  onClick={() => {
                    setPracticeChallenge(null);
                    setCode(template?.replace(/___/g, '') || '');
                  }}
                  className="btn btn--ghost btn--sm"
                  style={{ color: 'var(--accent-rose)' }}
                >
                  Exit Practice Sandbox
                </button>
              )}
            </div>
          )}

          {/* TAB 4: Analytics */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Your Coding Analytics</h3>
              
              {analyticsData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Solved</span>
                      <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0' }}>{analyticsData.challenges_solved || 0}</h4>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Attempts</span>
                      <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0' }}>{analyticsData.total_attempts || 0}</h4>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Spent</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0 0' }}>
                        {Math.round((analyticsData.total_time_spent || 0) / 60)} mins
                      </h4>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Languages</span>
                      <p style={{ fontSize: '11px', margin: '4px 0 0', fontWeight: 600, color: 'var(--accent-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {analyticsData.languages_practiced?.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Difficulty Distribution</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['easy', 'medium', 'hard'].map(d => {
                        const count = analyticsData.difficulty_distribution?.[d] || 0;
                        const total = (analyticsData.difficulty_distribution?.easy || 0) + (analyticsData.difficulty_distribution?.medium || 0) + (analyticsData.difficulty_distribution?.hard || 0) || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={d}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', textTransform: 'capitalize', marginBottom: '4px' }}>
                              <span>{d}</span>
                              <strong>{count}</strong>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: d === 'easy' ? 'var(--accent-green)' : d === 'medium' ? 'var(--accent-amber)' : 'var(--accent-rose)' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No statistics compiled yet. Submit a challenge to begin tracking.</p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* DRAG SPLIT RESIZER HANDLE */}
      <div 
        onMouseDown={handleMouseDown}
        style={{
          width: '5px',
          cursor: 'col-resize',
          background: 'var(--border)',
          transition: 'background 0.2s',
          zIndex: 10
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-blue)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--border)'; }}
      />

      {/* 2. RIGHT WORKSPACE: Monaco Editor (Top) & Terminal (Bottom) */}
      <div 
        style={{ 
          width: `${100 - splitWidth}%`, 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-primary)'
        }}
      >
        
        {/* Editor controls bar */}
        <div 
          style={{ 
            height: '45px', 
            padding: '0 16px', 
            borderBottom: '1px solid var(--border)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {lang} Editor
            </span>
            {saveStatus && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {saveStatus}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              onClick={() => setZoom(z => Math.max(10, z - 1))}
              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              onClick={() => setZoom(z => Math.min(24, z + 1))}
              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button 
              onClick={handleCopyCode}
              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Copy Code"
            >
              <Copy size={16} />
            </button>
            <button 
              onClick={handleDownloadCode}
              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Download Code"
            >
              <Download size={16} />
            </button>
            <button 
              onClick={() => {
                const conf = window.confirm('Reset code template? Your current changes will be overwritten.');
                if (conf) setCode(template?.replace(/___/g, '') || '');
              }}
              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Reset Code Workspace"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* MONACO CODE EDITOR CANVAS */}
        <div style={{ flex: 1, minHeight: '200px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <Editor
            height="100%"
            language={lang}
            theme={editorTheme}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: zoom,
              minimap: { enabled: false },
              lineNumbers: 'on',
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: 'always',
              folding: true,
              wordWrap: 'on',
              renderLineHighlight: 'all',
              fontFamily: 'var(--font-mono)'
            }}
          />
        </div>

        {/* BOTTOM PANEL: Runner triggers, Test Cases, and AI review tabs */}
        <div style={{ height: '220px', display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)' }}>
          <div style={{ height: '40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyItems: 'space-between', alignItems: 'center', padding: '0 16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setOutputTab('output')}
                style={{
                  padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer',
                  color: outputTab === 'output' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: outputTab === 'output' ? '2px solid var(--accent-blue)' : 'none'
                }}
              >
                💻 Console Output
              </button>
              <button 
                onClick={() => setOutputTab('testcases')}
                style={{
                  padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer',
                  color: outputTab === 'testcases' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: outputTab === 'testcases' ? '2px solid var(--accent-blue)' : 'none'
                }}
              >
                🧪 Test Cases
              </button>
              <button 
                onClick={() => setOutputTab('review')}
                style={{
                  padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer',
                  color: outputTab === 'review' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  borderBottom: outputTab === 'review' ? '2px solid var(--accent-blue)' : 'none'
                }}
              >
                ✨ AI Review
              </button>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRun}
                disabled={running}
                className="btn btn--secondary btn--sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={12} />
                {running ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={handleVerify}
                disabled={validatingSolution}
                className="btn btn--primary btn--sm"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-violet) 100%)',
                  color: 'white'
                }}
              >
                <CheckCircle size={12} />
                {validatingSolution ? 'Analyzing...' : 'Submit Challenge'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Console Tab */}
            {outputTab === 'output' && (
              <>
                {successMsg && (
                  <div style={{ color: 'var(--accent-green)', fontSize: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏆</span>
                    <strong>{successMsg}</strong>
                  </div>
                )}

                {errors && (
                  <div style={{ color: 'var(--accent-rose)', fontSize: '12px', fontFamily: 'var(--font-mono)', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', padding: '10px', borderRadius: '6px' }}>
                    ❌ {errors}
                  </div>
                )}

                {sqlResult && sqlResult.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                          {Object.keys(sqlResult[0]).map(key => (
                            <th key={key} style={{ padding: '6px' }}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlResult.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            {Object.values(row).map((v: any, j) => (
                              <td key={j} style={{ padding: '6px', color: 'var(--text-secondary)' }}>{String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!isWeb && consoleLogs && consoleLogs.length > 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {consoleLogs.map((log, i) => (
                      <div key={i} style={{ color: log.includes('Error') ? 'var(--accent-rose)' : 'inherit' }}>
                        &gt; {log}
                      </div>
                    ))}
                  </div>
                )}

                {!errors && !successMsg && !sqlResult && consoleLogs.length === 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 'auto' }}>
                    No output. Run code or submit challenge to view results.
                  </span>
                )}
              </>
            )}

            {/* Test Cases Tab */}
            {outputTab === 'testcases' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {testCasesResults.length > 0 ? (
                  testCasesResults.map((tc, i) => (
                    <div 
                      key={i} 
                      style={{
                        padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: tc.passed ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.05)',
                        display: 'flex', justifyItems: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600 }}>Test Case {i + 1}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Input: <code>{tc.input}</code> | Expected: <code>{tc.expected}</code>
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: tc.passed ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                        {tc.passed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    No test case run data available. Submit your challenge to verify test criteria.
                  </div>
                )}
              </div>
            )}

            {/* AI Review Tab */}
            {outputTab === 'review' && (
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {aiReview ? (
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      <span>✨</span>
                      <span>AI Code Review Feedback</span>
                    </div>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{aiReview}</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    Submit challenge to request a detailed AI code review for optimizations, best practices, and readability.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
