import { useState, useEffect } from 'react';

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
const runBashCommand = (command) => {
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

export default function InteractivePlayground({ language, template, instruction, answer, onCorrect }) {
  const [code, setCode] = useState('');
  const [sqlResult, setSqlResult] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [errors, setErrors] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [running, setRunning] = useState(false);
  const [verified, setVerified] = useState(false);

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
  }, [template]);

  const lang = language?.toLowerCase();
  const isSql = lang === 'sql';
  const isPython = lang === 'python';
  const isWeb = ['html', 'css'].includes(lang);
  const isJs = ['javascript', 'js'].includes(lang);
  const isBash = lang === 'bash' || lang === 'sh';
  const isDockerfile = lang === 'dockerfile';
  const isJava = lang === 'java';

  const handleRun = () => {
    setErrors('');
    setSqlResult(null);
    setConsoleLogs([]);
    setSuccessMsg('');
    setRunning(true);

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
      } else if (isJs) {
        const res = runJSCode(code);
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

  const handleVerify = () => {
    setErrors('');
    setSuccessMsg('');
    const userCode = code.trim();
    const cleanAnswer = answer?.trim();

    if (!cleanAnswer) return;

    // Helper: normalize whitespace and case for comparison
    const normalize = (str) => str.replace(/\s+/g, ' ').replace(/[;']/g, '"').trim().toLowerCase();

    // Build the "full correct query" for text match
    const correctCode = template ? template.replace(/___/g, answer) : answer;

    // 1. Exact normalized text match → immediate pass
    if (normalize(userCode) === normalize(correctCode) || normalize(userCode) === normalize(cleanAnswer)) {
      if (isSql) {
        const res = runSQLQuery(code);
        if (res.success) setSqlResult(res.rows);
      }
      triggerSuccess();
      return;
    }

    // 2. SQL: compare query execution results
    if (isSql) {
      const userRes = runSQLQuery(code);
      if (!userRes.success) {
        setErrors(`SQL Error: ${userRes.error}`);
        return;
      }
      setSqlResult(userRes.rows);

      const expectedRes = runSQLQuery(cleanAnswer);
      if (!expectedRes.success) {
        // Can't compare — fall through to simple contains check
      } else {
        // Compare result sets: same columns, same rows in same order
        const serializeRows = (rows) => {
          if (!rows || rows.length === 0) return '[]';
          return JSON.stringify(rows.map(row => {
            const keys = Object.keys(row).sort();
            const norm = {};
            keys.forEach(k => { norm[k] = String(row[k]).toLowerCase().trim(); });
            return norm;
          }));
        };
        const serializeCols = (rows) => {
          if (!rows || rows.length === 0) return '';
          return Object.keys(rows[0]).sort().join(',');
        };

        const userSer = serializeRows(userRes.rows);
        const expSer = serializeRows(expectedRes.rows);
        const userCols = serializeCols(userRes.rows);
        const expCols = serializeCols(expectedRes.rows);

        if (userSer === expSer && userCols === expCols) {
          triggerSuccess();
          return;
        } else {
          // Rows mismatch — give a helpful specific error
          if (userCols !== expCols) {
            setErrors(`Column mismatch: Expected columns [${expCols}] but got [${userCols}]. Check which columns you are selecting.`);
          } else if (userRes.rows.length !== expectedRes.rows.length) {
            setErrors(`Row count mismatch: Expected ${expectedRes.rows.length} row(s) but got ${userRes.rows.length}. Check your WHERE / LIMIT clause.`);
          } else {
            setErrors(`The result values don't match the expected answer. Double-check your column selection, filtering conditions, or ORDER BY clause.`);
          }
          return;
        }
      }
    }

    // 3. Non-SQL: contains-answer check with execution validation
    const userCodeLower = userCode.toLowerCase();
    const answerLower = cleanAnswer.toLowerCase();

    if (userCodeLower.includes(answerLower)) {
      if (isPython) {
        const res = runPythonCode(code);
        if (res.success) {
          setConsoleLogs(res.logs);
          triggerSuccess();
        } else {
          setErrors(`Python execution error: ${res.error}`);
        }
      } else if (isJs) {
        const res = runJSCode(code);
        if (res.success) {
          setConsoleLogs(res.logs);
          triggerSuccess();
        } else {
          setErrors(`JavaScript execution error: ${res.error}`);
        }
      } else if (isBash) {
        const res = runBashCommand(code);
        if (res.success) {
          setConsoleLogs(res.logs);
          triggerSuccess();
        }
      } else if (isDockerfile) {
        const res = runDockerfileBuild(code);
        if (res.success) {
          setConsoleLogs(res.logs);
          triggerSuccess();
        } else {
          setErrors(res.error);
        }
      } else if (isJava) {
        const res = runJavaCode(code);
        if (res.success) {
          setConsoleLogs(res.logs);
          triggerSuccess();
        } else {
          setErrors(res.error);
        }
      } else {
        triggerSuccess();
      }
    } else {
      setErrors(`Solution check failed. Make sure to implement the correct answer: "${answer}"`);
    }
  };

  const triggerSuccess = () => {
    setSuccessMsg('✨ Excellent work! The validation test passed.');
    setVerified(true);
    onCorrect();
  };

  return (
    <div className="interactive-playground" style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      margin: 'var(--space-6) 0',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Header Panel */}
      <div className="playground-header" style={{
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <span style={{
            marginLeft: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)'
          }}>
            ⚡ {language?.toUpperCase()} PLAYGROUND
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!isWeb && (
            <button
              className="btn btn--secondary btn--sm"
              onClick={handleRun}
              disabled={running}
              style={{ padding: '4px 12px', fontSize: '12px' }}
            >
              {running ? 'Running...' : 'Run Code ⚡'}
            </button>
          )}
          <button
            className="btn btn--primary btn--sm"
            onClick={handleVerify}
            disabled={verified}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              background: verified ? 'var(--accent-green)' : 'var(--accent-blue)',
              color: 'white'
            }}
          >
            {verified ? 'Verified ✓' : 'Verify Code ✓'}
          </button>
        </div>
      </div>

      <div className="playground-body" style={{
        display: 'grid',
        gridTemplateColumns: isWeb ? '1fr' : '1fr 1fr',
        minHeight: '280px',
        background: 'var(--bg-primary)'
      }}>
        {/* Editor Pane */}
        <div className="playground-editor" style={{
          padding: 'var(--space-4)',
          borderRight: isWeb ? 'none' : '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>EDITOR</span>
            {template && (
              <button
                onClick={() => {
                  const cleanTemplate = template.replace(/___/g, '');
                  setCode(cleanTemplate || '');
                  setVerified(false);
                  setSuccessMsg('');
                  setErrors('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Reset Template ↺
              </button>
            )}
          </div>
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (verified) setVerified(false);
            }}
            style={{
              width: '100%',
              flex: 1,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              padding: 'var(--space-3)',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.6'
            }}
            placeholder={`Write your ${language || 'code'} here...`}
          />
        </div>

        {/* Output/Live Preview Pane */}
        <div className="playground-results" style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: isWeb ? 'none' : '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
            {isWeb ? 'LIVE PREVIEW' : 'OUTPUT PANEL'}
          </span>
          
          <div style={{
            flex: 1,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Success Rewards Message Card */}
            {successMsg && (
              <div style={{
                background: 'hsla(142, 71%, 45%, 0.1)',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                animation: 'scaleIn 0.3s var(--ease-spring)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: 'var(--shadow-glow-green)'
                }}>
                  ✓
                </div>
                <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>Practice Challenge Completed!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
                  {successMsg}
                </p>
                <div style={{
                  marginTop: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--accent-amber)',
                  background: 'rgba(251, 191, 36, 0.1)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}>
                  ✦ XP Rewards Active
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors && (
              <div style={{
                color: 'var(--accent-rose)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                background: 'hsla(346, 77%, 50%, 0.08)',
                border: '1px solid hsla(346, 77%, 50%, 0.2)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)'
              }}>
                ❌ {errors}
              </div>
            )}

            {/* SQL Results Grid Table */}
            {isSql && sqlResult && (
              <div style={{ width: '100%' }}>
                {sqlResult.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        {Object.keys(sqlResult[0]).map((key) => (
                          <th key={key} style={{ textAlign: 'left', padding: '8px' }}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} style={{ padding: '8px', color: 'var(--text-secondary)' }}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(No rows returned matching criteria)</span>
                )}
              </div>
            )}

            {/* Console Log outputs (Python / JS / Bash / Dockerfile / Java) */}
            {!isWeb && consoleLogs && consoleLogs.length > 0 && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#abb2bf',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {consoleLogs.map((log, i) => (
                  <div key={i} style={{
                    color: log.startsWith('Error') ? 'var(--accent-rose)' :
                           log.startsWith('Warning') ? 'var(--accent-amber)' :
                           log.startsWith('$') ? 'var(--accent-blue)' : '#e5c07b'
                  }}>
                    {log.startsWith('$') ? '' : '> '}{log}
                  </div>
                ))}
              </div>
            )}

            {/* Web Dev HTML Live Preview */}
            {lang === 'html' && (
              <iframe
                title="html-preview"
                srcDoc={`<!DOCTYPE html><html><head><style>body { font-family: sans-serif; color: #fff; margin: 10px; }</style></head><body>${code}</body></html>`}
                style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
              />
            )}

            {/* Web Dev CSS Live Preview */}
            {lang === 'css' && (
              <iframe
                title="css-preview"
                srcDoc={`<!DOCTYPE html><html><head><style>body { font-family: sans-serif; color: #fff; margin: 10px; } .box { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 4px; text-align: center; transition: all 0.3s; } ${code}</style></head><body><div style="padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:12px; font-size:10px; color:#888;">CSS PREVIEW AREA</div><h1>Heading 1 (h1)</h1><p>This is a paragraph element (p) that will be styled by your CSS rules.</p><div class="container" style="border: 1px dashed #444; padding: 12px; border-radius: 6px; margin-top: 12px; display: flex; flex-direction: column; gap: 8px;"><div class="box">Flex Item 1</div><div class="box">Flex Item 2</div></div></body></html>`}
                style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
              />
            )}

            {/* Empty Console State */}
            {!errors && !successMsg && !sqlResult && consoleLogs.length === 0 && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 'auto' }}>
                {isWeb ? 'Type HTML/CSS on left to see live preview.' : 'Click "Run Code" to view console outputs.'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Database Schema / Helper Footer */}
      {isSql && (
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <strong>Available Tables:</strong> 
          <span style={{ marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>users</span> (id, first_name, email, active, age) | 
          <span style={{ marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>products</span> (id, name, price, category) | 
          <span style={{ marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>orders</span> (id, user_id, amount, status)
        </div>
      )}
      {isBash && (
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <strong>Docker Sandbox Commands:</strong> try running <code style={{ color: 'var(--accent-blue)', background: 'none', padding: 0 }}>docker ps</code>, <code style={{ color: 'var(--accent-blue)', background: 'none', padding: 0 }}>docker images</code>, <code style={{ color: 'var(--accent-blue)', background: 'none', padding: 0 }}>docker run nginx</code>, or <code style={{ color: 'var(--accent-blue)', background: 'none', padding: 0 }}>git status</code>.
        </div>
      )}
    </div>
  );
}
