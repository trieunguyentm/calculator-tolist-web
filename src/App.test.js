import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders app header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Jenkins React Test App/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders tab buttons', () => {
    render(<App />);
    const calculatorTab = screen.getByText('Calculator');
    const todoTab = screen.getByText('Todo List');
    expect(calculatorTab).toBeInTheDocument();
    expect(todoTab).toBeInTheDocument();
  });

  test('switches between tabs', () => {
    render(<App />);
    const todoTab = screen.getByText('Todo List');
    
    fireEvent.click(todoTab);
    
    const todoHeader = screen.getByText(/📝 Todo List/i);
    expect(todoHeader).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(<App />);
    const footerElement = screen.getByText(/Built with React • Tested with Jenkins/i);
    expect(footerElement).toBeInTheDocument();
  });
});
