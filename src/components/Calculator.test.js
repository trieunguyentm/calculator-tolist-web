import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from './Calculator';

describe('Calculator Component', () => {
  test('renders calculator display', () => {
    const { container } = render(<Calculator />);
    const display = container.querySelector('.calculator-display');
    expect(display).toBeInTheDocument();
    expect(display).toHaveTextContent('0');
  });

  test('displays digit when clicked', () => {
    const { container } = render(<Calculator />);
    const buttons = screen.getAllByText('5');
    const button5 = buttons.find(btn => btn.classList.contains('calculator-button'));
    fireEvent.click(button5);
    
    const display = container.querySelector('.calculator-display');
    expect(display).toHaveTextContent('5');
  });

  test('performs addition', () => {
    const { container } = render(<Calculator />);
    
    const button5 = screen.getAllByText('5').find(btn => btn.classList.contains('calculator-button'));
    const buttonPlus = screen.getByText('+');
    const button3 = screen.getByText('3');
    const buttonEquals = screen.getByText('=');
    
    fireEvent.click(button5);
    fireEvent.click(buttonPlus);
    fireEvent.click(button3);
    fireEvent.click(buttonEquals);
    
    const display = container.querySelector('.calculator-display');
    expect(display).toHaveTextContent('8');
  });

  test('performs subtraction', () => {
    const { container } = render(<Calculator />);
    
    const button9 = screen.getByText('9');
    const buttonMinus = screen.getByText('−');
    const button4 = screen.getByText('4');
    const buttonEquals = screen.getByText('=');
    
    fireEvent.click(button9);
    fireEvent.click(buttonMinus);
    fireEvent.click(button4);
    fireEvent.click(buttonEquals);
    
    const display = container.querySelector('.calculator-display');
    expect(display).toHaveTextContent('5');
  });

  test('clears display', () => {
    const { container } = render(<Calculator />);
    
    const button7 = screen.getByText('7');
    const buttonAC = screen.getByText('AC');
    
    fireEvent.click(button7);
    fireEvent.click(buttonAC);
    
    const display = container.querySelector('.calculator-display');
    expect(display).toHaveTextContent('0');
  });
});
