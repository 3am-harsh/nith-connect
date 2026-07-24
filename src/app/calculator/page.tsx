/* eslint-disable */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  FileText, 
  Key, 
  Upload, 
  Download, 
  Search, 
  Sparkles, 
  X, 
  File, 
  Plus, 
  CornerDownLeft, 
  Maximize2, 
  Minimize2,
  FileCheck,
  Edit3,
  Calendar,
  CheckCircle2,
  Moon,
  Sun,
  Database
} from 'lucide-react';
import { 
  getSecrets, addSecret, deleteSecret, 
  getNotes, addNote, updateNote, deleteNote, 
  getFiles, addFile, deleteFile,
  SecretItem, NoteItem, FileItem 
} from './db';
import './calculator.css';

// --- MATH EXPRESSION PARSER ENGINE ---

class MathParser {
  private tokens: string[] = [];
  private pos = 0;

  constructor(private expr: string, private isDeg: boolean) {
    this.tokenize();
  }

  private tokenize() {
    // Matches floating numbers, alphabetical function names/constants, or single characters
    const regex = /\d+(\.\d+)?|[a-zA-Z]+|π|√|\S/g;
    this.tokens = this.expr.match(regex) || [];
  }

  private peek(): string {
    return this.tokens[this.pos] || '';
  }

  private consume(expected?: string): string {
    const t = this.peek();
    if (expected && t !== expected) {
      throw new Error(`Expected "${expected}" but got "${t}"`);
    }
    this.pos++;
    return t;
  }

  public parse(): number {
    this.pos = 0;
    if (this.tokens.length === 0) return 0;
    const val = this.expr0();
    if (this.pos < this.tokens.length) {
      throw new Error('Unexpected character sequence');
    }
    return val;
  }

  // Add / Subtract
  private expr0(): number {
    let val = this.expr1();
    while (true) {
      const op = this.peek();
      if (op === '+' || op === '-') {
        this.consume();
        const rhs = this.expr1();
        val = op === '+' ? val + rhs : val - rhs;
      } else {
        break;
      }
    }
    return val;
  }

  // Multiply / Divide
  private expr1(): number {
    let val = this.expr2();
    while (true) {
      const op = this.peek();
      if (op === '*' || op === '/' || op === '×' || op === '÷') {
        this.consume();
        const rhs = this.expr2();
        if (op === '/' || op === '÷') {
          if (rhs === 0) throw new Error('Division by zero');
          val = val / rhs;
        } else {
          val = val * rhs;
        }
      } else {
        break;
      }
    }
    return val;
  }

  // Exponentiation (Power ^)
  private expr2(): number {
    let val = this.expr3();
    while (true) {
      const op = this.peek();
      if (op === '^') {
        this.consume();
        const rhs = this.expr2(); // Right-associative exponentiation
        val = Math.pow(val, rhs);
      } else {
        break;
      }
    }
    return val;
  }

  // Unary operators and factorials
  private expr3(): number {
    const op = this.peek();
    if (op === '-') {
      this.consume();
      return -this.expr3();
    } else if (op === '+') {
      this.consume();
      return this.expr3();
    }
    
    let val = this.primary();
    
    // Postfix factorial
    if (this.peek() === '!') {
      this.consume();
      val = this.factorial(val);
    }
    return val;
  }

  private factorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Non-integer factorial');
    }
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  // Primary atoms: numbers, constants, parentheses, functions
  private primary(): number {
    const t = this.peek();
    if (!t) {
      throw new Error('Incomplete expression');
    }

    if (t === '(') {
      this.consume();
      const val = this.expr0();
      this.consume(')');
      return val;
    }

    if (t.toLowerCase() === 'pi' || t === 'π') {
      this.consume();
      return Math.PI;
    }
    if (t === 'e') {
      this.consume();
      return Math.E;
    }

    // Supported functions
    const funcs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', '√'];
    if (funcs.includes(t)) {
      this.consume();
      const hasParen = this.peek() === '(';
      if (hasParen) {
        this.consume('(');
      }
      // If no parenthesis, evaluate the immediate operand
      const arg = hasParen ? this.expr0() : this.expr3();
      if (hasParen) {
        this.consume(')');
      }

      switch (t) {
        case 'sin':
          return Math.sin(this.isDeg ? (arg * Math.PI) / 180 : arg);
        case 'cos':
          return Math.cos(this.isDeg ? (arg * Math.PI) / 180 : arg);
        case 'tan':
          return Math.tan(this.isDeg ? (arg * Math.PI) / 180 : arg);
        case 'asin':
          const rasin = Math.asin(arg);
          return this.isDeg ? (rasin * 180) / Math.PI : rasin;
        case 'acos':
          const racos = Math.acos(arg);
          return this.isDeg ? (racos * 180) / Math.PI : racos;
        case 'atan':
          const ratan = Math.atan(arg);
          return this.isDeg ? (ratan * 180) / Math.PI : ratan;
        case 'log':
          return Math.log10(arg);
        case 'ln':
          return Math.log(arg);
        case 'sqrt':
        case '√':
          if (arg < 0) throw new Error('Square root of negative');
          return Math.sqrt(arg);
        default:
          return 0;
      }
    }

    // Float or Integer parsing
    if (/^\d+(\.\d+)?$/.test(t)) {
      this.consume();
      return parseFloat(t);
    }

    throw new Error(`Unexpected token "${t}"`);
  }
}

// Preprocessor to clean expressions and insert implicit multiplications
function preprocessExpression(expr: string): string {
  let s = expr;
  
  // Implicit multiplication: number followed by a parenthesis/constant/function
  s = s.replace(/(\d+)(pi|π|e|sin|cos|tan|ln|log|sqrt|√|\()/gi, '$1*$2');
  
  // Implicit multiplication: parenthesis/constant followed by number/parenthesis/constant/function
  s = s.replace(/(pi|π|e|\))(\d+|pi|π|e|sin|cos|tan|ln|log|sqrt|√|\()/gi, '$1*$2');
  
  return s;
}

function evaluateExpression(expr: string, isDeg: boolean): string {
  try {
    const preprocessed = preprocessExpression(expr);
    const parser = new MathParser(preprocessed, isDeg);
    const resultVal = parser.parse();
    
    if (isNaN(resultVal)) return 'Error';
    if (!isFinite(resultVal)) return 'Error';

    // Round off minor floating point noise
    const str = resultVal.toString();
    if (str.includes('.') && str.length > 12) {
      return parseFloat(resultVal.toFixed(10)).toString();
    }
    return str;
  } catch (error: any) {
    return 'Error';
  }
}

// --- MAIN PAGE COMPONENT ---

export default function CalculatorPage() {
  const [mounted, setMounted] = useState(false);

  // Calculator State
  const [input, setInput] = useState('0');
  const [history, setHistory] = useState('');
  const [scientificMode, setScientificMode] = useState(false);
  const [angleMode, setAngleMode] = useState<'rad' | 'deg'>('rad');
  const [memory, setMemory] = useState<number | null>(null);
  const [shouldResetOnNextKey, setShouldResetOnNextKey] = useState(false);

  // Vault/Secret State
  const [showVault, setShowVault] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [activeTab, setActiveTab] = useState<'secrets' | 'notes' | 'files'>('secrets');
  const [searchQuery, setSearchQuery] = useState('');

  // Vault Items State
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  // Secrets Input Form
  const [secretLabel, setSecretLabel] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<{ [id: string]: boolean }>({});
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);

  // Notes Input Form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  // Files State
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent NextJS Hydration issues
  useEffect(() => {
    setMounted(true);
    // Initialize DB records
    loadVaultData();
  }, []);

  const loadVaultData = async () => {
    try {
      const dbSecrets = await getSecrets();
      const dbNotes = await getNotes();
      const dbFiles = await getFiles();
      setSecrets(dbSecrets);
      setNotes(dbNotes);
      setFiles(dbFiles);
    } catch (e) {
      console.error('Error opening local IndexedDB:', e);
    }
  };

  if (!mounted) {
    return (
      <div className="calc-container-wrapper">
        <div className="liquid-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <div className="glass-calculator-card" style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem' }}>Loading glass environment...</div>
        </div>
      </div>
    );
  }

  // --- CALCULATOR ACTIONS ---

  const handleKeyPress = (key: string, e?: React.MouseEvent) => {
    // Add visual ripple overlay logic
    if (e) {
      const btn = e.currentTarget as HTMLElement;
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);
    }

    if (key === 'AC') {
      setInput('0');
      setHistory('');
      setShouldResetOnNextKey(false);
    } else if (key === '⌫') {
      if (shouldResetOnNextKey) {
        setInput('0');
        setShouldResetOnNextKey(false);
      } else {
        if (input.length <= 1) {
          setInput('0');
        } else {
          setInput(input.slice(0, -1));
        }
      }
    } else if (key === '=') {
      // Evaluate Secret Chamber trigger
      if (input === '6969') {
        triggerVaultUnlock();
        return;
      }

      const result = evaluateExpression(input, angleMode === 'deg');
      if (result === '6969') {
        triggerVaultUnlock();
        return;
      }
      
      setHistory(input + ' =');
      setInput(result);
      setShouldResetOnNextKey(true);
    } else if (key === '+/-') {
      if (input.startsWith('-')) {
        setInput(input.slice(1));
      } else if (input !== '0') {
        setInput('-' + input);
      }
    } else if (key === '%') {
      try {
        const val = parseFloat(input);
        if (!isNaN(val)) {
          setInput((val / 100).toString());
        }
      } catch {
        setInput('Error');
      }
    } else if (key === 'Rad' || key === 'Deg') {
      setAngleMode(angleMode === 'rad' ? 'deg' : 'rad');
    } else if (['mc', 'm+', 'm-', 'mr'].includes(key)) {
      handleMemory(key);
    } else {
      // Standard digits & operations
      let nextInput = input;
      if (input === '0' && !['+', '-', '×', '÷', '^', '%', '.', '!'].includes(key)) {
        // Replace initial zero, unless adding function
        if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', '√'].includes(key)) {
          nextInput = key + '(';
        } else {
          nextInput = key;
        }
      } else {
        if (shouldResetOnNextKey && !['+', '-', '×', '÷', '^', '%', '!'].includes(key)) {
          // Restart input if operator is not clicked
          if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', '√'].includes(key)) {
            nextInput = key + '(';
          } else {
            nextInput = key;
          }
        } else {
          if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', '√'].includes(key)) {
            nextInput = input + key + '(';
          } else {
            nextInput = input + key;
          }
        }
      }
      setInput(nextInput);
      setShouldResetOnNextKey(false);
    }
  };

  const handleMemory = (op: string) => {
    const currentNum = parseFloat(input);
    if (isNaN(currentNum)) return;

    switch (op) {
      case 'mc':
        setMemory(null);
        break;
      case 'mr':
        if (memory !== null) {
          setInput(memory.toString());
          setShouldResetOnNextKey(true);
        }
        break;
      case 'm+':
        setMemory((memory || 0) + currentNum);
        setShouldResetOnNextKey(true);
        break;
      case 'm-':
        setMemory((memory || 0) - currentNum);
        setShouldResetOnNextKey(true);
        break;
    }
  };

  const triggerVaultUnlock = () => {
    setIsUnlocking(true);
    // Play sound or vibration (haptic click) if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    setTimeout(() => {
      setShowVault(true);
      setIsUnlocking(false);
      setInput('0');
      setHistory('');
    }, 850);
  };

  const lockVault = () => {
    setShowVault(false);
    setInput('0');
    setHistory('');
  };

  // --- VAULT ACTIONS ---

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretLabel || !secretValue) return;

    try {
      await addSecret(secretLabel, secretValue);
      setSecretLabel('');
      setSecretValue('');
      loadVaultData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSecret = async (id: string) => {
    try {
      await deleteSecret(id);
      loadVaultData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copySecretToClipboard = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedSecretId(id);
    setTimeout(() => setCopiedSecretId(null), 1500);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;

    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, noteTitle, noteContent);
      } else {
        await addNote(noteTitle, noteContent);
      }
      setNoteTitle('');
      setNoteContent('');
      setEditingNoteId(null);
      setShowNoteEditor(false);
      loadVaultData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNoteEditor(true);
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering edit
    try {
      await deleteNote(id);
      if (editingNoteId === id) {
        setEditingNoteId(null);
        setNoteTitle('');
        setNoteContent('');
      }
      loadVaultData();
    } catch (err) {
      console.error(err);
    }
  };

  // Files Upload Actions
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        try {
          await addFile(file.name, file.type, file.size, event.target.result);
          loadVaultData();
        } catch (err) {
          alert('Failed to save file. Size might exceed system limitations.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteFile(id);
      loadVaultData();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadFile = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering secrets/notes/files by Search Query
  const filteredSecrets = secrets.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="calc-container-wrapper">
      {/* Dynamic Ambient Background */}
      <div className="liquid-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      {/* Unlock Flash Effect */}
      <div className={`screen-flash-unlock ${isUnlocking ? 'trigger' : ''}`}></div>

      {!showVault ? (
        /* --- SCIENTIFIC CALCULATOR CARD --- */
        <div className={`glass-calculator-card ${scientificMode ? 'scientific' : ''}`}>
          
          <div className="calc-header">
            <span className="calc-logo">
              <Sparkles size={18} style={{ color: '#ff9f0a' }} />
              GlassCalc Pro
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="mode-toggle-btn"
                onClick={() => setScientificMode(!scientificMode)}
              >
                {scientificMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                {scientificMode ? 'Basic Mode' : 'Scientific'}
              </button>
            </div>
          </div>

          {/* Calculator Glass Screen */}
          <div className="calc-display-container">
            <div className="calc-history">{history}</div>
            <div className="calc-current-input">
              {input}
            </div>
          </div>

          {/* Keypad Layout */}
          <div className="calc-grid-layout">
            
            {/* Scientific subkeys grid (Slides out in scientificMode) */}
            {scientificMode && (
              <div className="calc-keys-scientific">
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress(angleMode === 'rad' ? 'Rad' : 'Deg', e)}>
                  {angleMode === 'rad' ? 'Rad' : 'Deg'}
                </button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('!', e)}>x!</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('(', e)}>(</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress(')', e)}>)</button>
                
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('sin', e)}>sin</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('cos', e)}>cos</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('tan', e)}>tan</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('^', e)}>xʸ</button>
                
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('asin', e)}>sin⁻¹</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('acos', e)}>cos⁻¹</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('atan', e)}>tan⁻¹</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('√', e)}>√</button>

                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('log', e)}>log</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('ln', e)}>ln</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('π', e)}>π</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('e', e)}>e</button>

                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('mc', e)}>MC</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('mr', e)}>MR</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('m+', e)}>M+</button>
                <button className="calc-btn btn-sci" onClick={(e) => handleKeyPress('m-', e)}>M-</button>
              </div>
            )}

            {/* Standard Keypad Grid */}
            <div className="calc-keys-standard">
              <button className="calc-btn btn-action" onClick={(e) => handleKeyPress('AC', e)}>AC</button>
              <button className="calc-btn btn-action" onClick={(e) => handleKeyPress('+/-', e)}>+/-</button>
              <button className="calc-btn btn-action" onClick={(e) => handleKeyPress('%', e)}>%</button>
              <button className="calc-btn btn-operator" onClick={(e) => handleKeyPress('÷', e)}>÷</button>

              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('7', e)}>7</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('8', e)}>8</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('9', e)}>9</button>
              <button className="calc-btn btn-operator" onClick={(e) => handleKeyPress('×', e)}>×</button>

              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('4', e)}>4</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('5', e)}>5</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('6', e)}>6</button>
              <button className="calc-btn btn-operator" onClick={(e) => handleKeyPress('-', e)}>-</button>

              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('1', e)}>1</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('2', e)}>2</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('3', e)}>3</button>
              <button className="calc-btn btn-operator" onClick={(e) => handleKeyPress('+', e)}>+</button>

              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('0', e)}>0</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('.', e)}>.</button>
              <button className="calc-btn btn-num" onClick={(e) => handleKeyPress('⌫', e)}>⌫</button>
              <button className="calc-btn btn-equals" onClick={(e) => handleKeyPress('=', e)}>=</button>
            </div>

          </div>
        </div>
      ) : (
        /* --- SECRET VAULT CARD DISPLAY --- */
        <div className="secret-vault-card">
          <div className="vault-header">
            <div className="vault-title">
              <Unlock size={24} style={{ color: '#00f0ff' }} />
              <h2>Secret Liquid Vault</h2>
            </div>
            
            {/* Search Bar for Vault */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'rgba(255,255,255,0.4)' }} />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="vault-input"
                style={{ paddingLeft: '38px', marginBottom: 0 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="vault-lock-btn" onClick={lockVault}>
              <Lock size={15} />
              Lock Vault
            </button>
          </div>

          <div className="vault-body">
            
            {/* Sidebar Tabs */}
            <div className="vault-tabs">
              <button 
                className={`vault-tab-btn secrets-tab ${activeTab === 'secrets' ? 'active' : ''}`}
                onClick={() => setActiveTab('secrets')}
              >
                <Key size={18} />
                Credentials
              </button>
              <button 
                className={`vault-tab-btn notes-tab ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <FileText size={18} />
                Private Notes
              </button>
              <button 
                className={`vault-tab-btn files-tab ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <Database size={18} />
                Secret Files
              </button>
            </div>

            {/* Main Tabs Content */}
            <div className="vault-content">
              
              {/* Tab 1: Secrets & Credentials */}
              {activeTab === 'secrets' && (
                <div>
                  <div className="vault-content-header">
                    <span className="vault-section-title">
                      <Key size={18} style={{ color: '#00f0ff' }} />
                      Secrets & Credentials
                    </span>
                  </div>

                  {/* Add secret Form */}
                  <form onSubmit={handleAddSecret} className="vault-form">
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        placeholder="Label (e.g. Netflix, Wifi)"
                        className="vault-input"
                        style={{ flex: 1, marginBottom: 0 }}
                        value={secretLabel}
                        onChange={(e) => setSecretLabel(e.target.value)}
                        required
                      />
                      <input 
                        type="password" 
                        placeholder="Secret Value / Password"
                        className="vault-input"
                        style={{ flex: 1, marginBottom: 0 }}
                        value={secretValue}
                        onChange={(e) => setSecretValue(e.target.value)}
                        required
                      />
                      <button type="submit" className="vault-btn-submit">
                        <Plus size={16} style={{ marginRight: '6px', display: 'inline' }} />
                        Add
                      </button>
                    </div>
                  </form>

                  {/* Secrets list */}
                  {filteredSecrets.length > 0 ? (
                    <div className="vault-list">
                      {filteredSecrets.map(s => (
                        <div key={s.id} className="vault-card">
                          <div className="secret-info">
                            <span className="secret-label">{s.label}</span>
                            <div className="secret-value-wrapper">
                              <span className="secret-value">
                                {visibleSecrets[s.id] ? s.value : '••••••••••••'}
                              </span>
                              <button 
                                className="vault-action-btn"
                                style={{ border: 'none', background: 'transparent', height: 'auto', width: 'auto', padding: '4px' }}
                                onClick={() => toggleSecretVisibility(s.id)}
                              >
                                {visibleSecrets[s.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <div className="vault-actions">
                            <button 
                              className="vault-action-btn"
                              onClick={() => copySecretToClipboard(s.id, s.value)}
                              title="Copy Secret"
                            >
                              {copiedSecretId === s.id ? <FileCheck size={16} style={{ color: '#34d399' }} /> : <Copy size={16} />}
                            </button>
                            <button 
                              className="vault-action-btn delete-btn"
                              onClick={() => handleDeleteSecret(s.id)}
                              title="Delete Secret"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="vault-empty-state">
                      <Key className="vault-empty-icon" />
                      <p>No credentials stored yet. Add your first secret!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Private Diary & Notes */}
              {activeTab === 'notes' && (
                <div>
                  <div className="vault-content-header">
                    <span className="vault-section-title">
                      <FileText size={18} style={{ color: '#c084fc' }} />
                      Private Logs & Notes
                    </span>
                    {!showNoteEditor && (
                      <button 
                        className="vault-btn-submit"
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteTitle('');
                          setNoteContent('');
                          setShowNoteEditor(true);
                        }}
                      >
                        <Plus size={16} style={{ marginRight: '6px', display: 'inline' }} />
                        New Note
                      </button>
                    )}
                  </div>

                  {/* Add/Edit Note Form */}
                  {showNoteEditor && (
                    <form onSubmit={handleSaveNote} className="vault-form">
                      <input 
                        type="text" 
                        placeholder="Note Title (Optional)"
                        className="vault-input"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                      />
                      <textarea 
                        placeholder="Write your secret notes here..."
                        className="vault-input vault-textarea"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        required
                      />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          className="mode-toggle-btn"
                          onClick={() => {
                            setShowNoteEditor(false);
                            setEditingNoteId(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="vault-btn-submit">
                          Save Note
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Notes List */}
                  {filteredNotes.length > 0 ? (
                    <div className="vault-list">
                      {filteredNotes.map(n => (
                        <div key={n.id} className="vault-card note-card" onClick={() => startEditNote(n)}>
                          <div className="note-header">
                            <span className="note-title">{n.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className="note-date">
                                <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                {new Date(n.timestamp).toLocaleDateString()}
                              </span>
                              <button 
                                className="vault-action-btn delete-btn"
                                onClick={(e) => handleDeleteNote(n.id, e)}
                                title="Delete Note"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="note-snippet">
                            {n.content.length > 200 ? n.content.slice(0, 200) + '...' : n.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="vault-empty-state">
                      <FileText className="vault-empty-icon" />
                      <p>No notes written. Pen down your first secret thoughts!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Secret Files */}
              {activeTab === 'files' && (
                <div>
                  <div className="vault-content-header">
                    <span className="vault-section-title">
                      <Database size={18} style={{ color: '#34d399' }} />
                      Secret Vault Files
                    </span>
                  </div>

                  {/* Drag-and-drop file upload */}
                  <div 
                    className={`file-dropzone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                  >
                    <Upload className="file-dropzone-icon" />
                    <p className="file-dropzone-text">Drag and drop any file here, or click to browse</p>
                    <p className="file-dropzone-subtext">Files are saved locally and securely inside browser database</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Files List */}
                  {filteredFiles.length > 0 ? (
                    <div className="vault-list">
                      {filteredFiles.map(f => {
                        const isImage = f.type.startsWith('image/');
                        return (
                          <div key={f.id} className="vault-card">
                            <div className="file-card-info">
                              <div className="file-icon" onClick={() => isImage && setSelectedImage(f.data)} style={{ cursor: isImage ? 'pointer' : 'default' }}>
                                {isImage ? (
                                  <img 
                                    src={f.data} 
                                    alt={f.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                                  />
                                ) : (
                                  <File size={20} />
                                )}
                              </div>
                              <div className="file-meta">
                                <span className="file-name" title={f.name}>{f.name}</span>
                                <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>

                            <div className="vault-actions">
                              <button 
                                className="vault-action-btn"
                                onClick={() => downloadFile(f)}
                                title="Download File"
                              >
                                <Download size={16} />
                              </button>
                              <button 
                                className="vault-action-btn delete-btn"
                                onClick={() => handleDeleteFile(f.id)}
                                title="Delete File"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="vault-empty-state">
                      <Database className="vault-empty-icon" />
                      <p>No files uploaded. Drop secret documents or images here!</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox Overlay */}
      {selectedImage && (
        <div className="calc-container-wrapper" style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} onClick={() => setSelectedImage(null)}>
          <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedImage(null)}>
            <X size={20} />
          </button>
          <img 
            src={selectedImage} 
            alt="Vault Preview" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
