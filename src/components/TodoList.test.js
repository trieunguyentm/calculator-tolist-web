import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from './TodoList';

describe('TodoList Component', () => {
  test('renders todo list header', () => {
    render(<TodoList />);
    const header = screen.getByText(/📝 Todo List/i);
    expect(header).toBeInTheDocument();
  });

  test('renders default todos', () => {
    render(<TodoList />);
    const todo1 = screen.getByText('Setup Jenkins server');
    const todo2 = screen.getByText('Create Freestyle job');
    expect(todo1).toBeInTheDocument();
    expect(todo2).toBeInTheDocument();
  });

  test('adds new todo', () => {
    render(<TodoList />);
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByText('Add');
    
    fireEvent.change(input, { target: { value: 'New test task' } });
    fireEvent.click(addButton);
    
    const newTodo = screen.getByText('New test task');
    expect(newTodo).toBeInTheDocument();
  });

  test('toggles todo completion', () => {
    render(<TodoList />);
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    
    const initialState = firstCheckbox.checked;
    fireEvent.click(firstCheckbox);
    
    expect(firstCheckbox.checked).toBe(!initialState);
  });

  test('deletes todo', () => {
    render(<TodoList />);
    const deleteButtons = screen.getAllByText('✕');
    const todoText = screen.getByText('Create Freestyle job');
    
    fireEvent.click(deleteButtons[1]);
    
    expect(todoText).not.toBeInTheDocument();
  });

  test('displays todo stats', () => {
    render(<TodoList />);
    const stats = screen.getByText(/completed/i);
    expect(stats).toBeInTheDocument();
  });
});
