import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from './Calculator';

describe('Calculator Component', () => {
  test('renders calculator display', () => {
    render(<Calculator />);
    const display = screen.getByText('0');
    expect(display).toBeInTheDocument();
  });

  test('displays digit when clicked', () => {
    render(<Calculator />);
    const button5 = screen.getByText('5');
    fireEvent.click(button5);
    
    const display = screen.getByText('5');
    expect(display).toBeInTheDocument();
  });

  test('performs addition', () => {
    render(<Calculator />);
    
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));
    
    const display = screen.getByText('8');
    expect(display).toBeInTheDocument();
  });

  test('performs subtraction', () => {
    render(<Calculator />);
    
    fireEvent.click(screen.getByText('9'));
    fireEvent.click(screen.getByText('−'));
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('='));
    
    const display = screen.getByText('5');
    expect(display).toBeInTheDocument();
  });

  test('clears display', () => {
    render(<Calculator />);
    
    fireEvent.click(screen.getByText('7'));
    fireEvent.click(screen.getByText('AC'));
    
    const display = screen.getByText('0');
    expect(display).toBeInTheDocument();
  });
});
