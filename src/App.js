import React, { useState } from 'react';
import './App.css';
import Calculator from './components/Calculator';
import TodoList from './components/TodoList';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Jenkins React Test App</h1>
        <p>Simple React application for Jenkins Freestyle Job testing</p>
      </header>

      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          Calculator
        </button>
        <button
          className={`tab-button ${activeTab === 'todo' ? 'active' : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          Todo List
        </button>
      </div>

      <main className="App-main">
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'todo' && <TodoList />}
      </main>

      <footer className="App-footer">
        <p>Built with React • Tested with Jenkins</p>
      </footer>
    </div>
  );
}

export default App;
