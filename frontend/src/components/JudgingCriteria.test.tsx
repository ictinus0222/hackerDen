import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JudgingCriteria } from './JudgingCriteria';
import type { JudgingCriterion } from '../types';

const mockCriteria: JudgingCriterion[] = [
  {
    id: 'criterion-1',
    name: 'Business Potential',
    description: 'How viable is this as a business?',
    completed: true
  },
  {
    id: 'criterion-2',
    name: 'Technical Innovation',
    description: 'How technically innovative is the solution?',
    completed: false
  },
  {
    id: 'criterion-3',
    name: 'User Experience',
    completed: false
  }
];

describe('JudgingCriteria', () => {
  it('renders all criteria correctly', () => {
    render(<JudgingCriteria criteria={mockCriteria} />);
    
    expect(screen.getByText('Judging Criteria')).toBeInTheDocument();
    expect(screen.getByText('Business Potential')).toBeInTheDocument();
    expect(screen.getByText('Technical Innovation')).toBeInTheDocument();
    expect(screen.getByText('User Experience')).toBeInTheDocument();
  });

  it('displays completion progress correctly', () => {
    render(<JudgingCriteria criteria={mockCriteria} />);
    
    expect(screen.getByText('1 of 3 criteria addressed (33%)')).toBeInTheDocument();
  });

  it('shows progress bar with correct width', () => {
    render(<JudgingCriteria criteria={mockCriteria} />);
    
    const progressBar = document.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '33.33333333333333%' });
  });

  it('displays descriptions when available', () => {
    render(<JudgingCriteria criteria={mockCriteria} />);
    
    expect(screen.getByText('How viable is this as a business?')).toBeInTheDocument();
    expect(screen.getByText('How technically innovative is the solution?')).toBeInTheDocument();
  });

  it('shows completed criteria with green styling', () => {
    render(<JudgingCriteria criteria={mockCriteria} />);
    
    const businessPotentialCard = screen.getByText('Business Potential').closest('div')?.parentElement?.parentElement;
    expect(businessPotentialCard).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('shows incomplete criteria with gray styling', () => {
    render(<JudgingCriteria criteria={mockCriteria} />);
    
    const technicalCard = screen.getByText('Technical Innovation').closest('div')?.parentElement?.parentElement;
    expect(technicalCard).toHaveClass('bg-gray-50', 'border-gray-200');
  });

  it('shows edit button when canEdit is true', () => {
    render(<JudgingCriteria criteria={mockCriteria} canEdit={true} />);
    
    expect(screen.getByText('Edit Criteria')).toBeInTheDocument();
  });

  it('does not show edit button when canEdit is false', () => {
    render(<JudgingCriteria criteria={mockCriteria} canEdit={false} />);
    
    expect(screen.queryByText('Edit Criteria')).not.toBeInTheDocument();
  });

  it('toggles criterion completion when clicked', async () => {
    const onUpdateCriteria = vi.fn();
    const user = userEvent.setup();
    
    render(
      <JudgingCriteria 
        criteria={mockCriteria} 
        onUpdateCriteria={onUpdateCriteria}
        canEdit={true} 
      />
    );
    
    await user.click(screen.getByText('Technical Innovation'));
    
    expect(onUpdateCriteria).toHaveBeenCalledWith([
      mockCriteria[0],
      { ...mockCriteria[1], completed: true },
      mockCriteria[2]
    ]);
  });

  it('does not toggle completion when canEdit is false', async () => {
    const onUpdateCriteria = vi.fn();
    const user = userEvent.setup();
    
    render(
      <JudgingCriteria 
        criteria={mockCriteria} 
        onUpdateCriteria={onUpdateCriteria}
        canEdit={false} 
      />
    );
    
    await user.click(screen.getByText('Technical Innovation'));
    
    expect(onUpdateCriteria).not.toHaveBeenCalled();
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<JudgingCriteria criteria={mockCriteria} canEdit={true} />);
    
    await user.click(screen.getByText('Edit Criteria'));
    
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('New Criterion Name *')).toBeInTheDocument();
  });

  it('allows editing criterion name and description', async () => {
    const user = userEvent.setup();
    render(<JudgingCriteria criteria={mockCriteria} canEdit={true} />);
    
    await user.click(screen.getByText('Edit Criteria'));
    
    const nameInput = screen.getByDisplayValue('Business Potential');
    await user.clear(nameInput);
    await user.type(nameInput, 'Market Viability');
    
    const descriptionTextarea = screen.getByDisplayValue('How viable is this as a business?');
    await user.clear(descriptionTextarea);
    await user.type(descriptionTextarea, 'Updated description');
    
    expect(nameInput).toHaveValue('Market Viability');
    expect(descriptionTextarea).toHaveValue('Updated description');
  });

  it('adds new criterion when form is filled and submitted', async () => {
    const onUpdateCriteria = vi.fn();
    const user = userEvent.setup();
    
    render(
      <JudgingCriteria 
        criteria={mockCriteria} 
        onUpdateCriteria={onUpdateCriteria}
        canEdit={true} 
      />
    );
    
    await user.click(screen.getByText('Edit Criteria'));
    
    const newNameInput = screen.getByPlaceholderText('e.g., Technical Innovation');
    const newDescriptionTextareas = screen.getAllByPlaceholderText('Describe what this criterion means...');
    const newDescriptionTextarea = newDescriptionTextareas[newDescriptionTextareas.length - 1]; // Get the last one (new criterion form)
    
    await user.type(newNameInput, 'Presentation Quality');
    await user.type(newDescriptionTextarea, 'How well is the project presented?');
    
    await user.click(screen.getByText('Add Criterion'));
    
    // Check that the new criterion appears in the edit form
    expect(screen.getByDisplayValue('Presentation Quality')).toBeInTheDocument();
  });

  it('disables add criterion button when name is empty', async () => {
    const user = userEvent.setup();
    render(<JudgingCriteria criteria={mockCriteria} canEdit={true} />);
    
    await user.click(screen.getByText('Edit Criteria'));
    
    const addButton = screen.getByText('Add Criterion');
    expect(addButton).toBeDisabled();
    
    const newNameInput = screen.getByPlaceholderText('e.g., Technical Innovation');
    await user.type(newNameInput, 'Test Criterion');
    
    expect(addButton).not.toBeDisabled();
  });

  it('removes criterion when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<JudgingCriteria criteria={mockCriteria} canEdit={true} />);
    
    await user.click(screen.getByText('Edit Criteria'));
    
    const removeButtons = screen.getAllByText('Remove Criterion');
    await user.click(removeButtons[0]);
    
    // Business Potential should be removed from the form
    expect(screen.queryByDisplayValue('Business Potential')).not.toBeInTheDocument();
  });

  it('saves changes when save button is clicked', async () => {
    const onUpdateCriteria = vi.fn();
    const user = userEvent.setup();
    
    render(
      <JudgingCriteria 
        criteria={mockCriteria} 
        onUpdateCriteria={onUpdateCriteria}
        canEdit={true} 
      />
    );
    
    await user.click(screen.getByText('Edit Criteria'));
    
    const nameInput = screen.getByDisplayValue('Business Potential');
    await user.clear(nameInput);
    await user.type(nameInput, 'Market Potential');
    
    await user.click(screen.getByText('Save Changes'));
    
    expect(onUpdateCriteria).toHaveBeenCalledWith([
      { ...mockCriteria[0], name: 'Market Potential' },
      mockCriteria[1],
      mockCriteria[2]
    ]);
  });

  it('cancels edit mode without saving changes', async () => {
    const onUpdateCriteria = vi.fn();
    const user = userEvent.setup();
    
    render(
      <JudgingCriteria 
        criteria={mockCriteria} 
        onUpdateCriteria={onUpdateCriteria}
        canEdit={true} 
      />
    );
    
    await user.click(screen.getByText('Edit Criteria'));
    
    const nameInput = screen.getByDisplayValue('Business Potential');
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');
    
    await user.click(screen.getByText('Cancel'));
    
    expect(onUpdateCriteria).not.toHaveBeenCalled();
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  it('shows empty state when no criteria exist', () => {
    render(<JudgingCriteria criteria={[]} canEdit={true} />);
    
    expect(screen.getByText('No judging criteria defined yet.')).toBeInTheDocument();
    expect(screen.getByText('Add some criteria to get started')).toBeInTheDocument();
  });

  it('shows 100% completion when all criteria are completed', () => {
    const completedCriteria = mockCriteria.map(c => ({ ...c, completed: true }));
    render(<JudgingCriteria criteria={completedCriteria} />);
    
    expect(screen.getByText('3 of 3 criteria addressed (100%)')).toBeInTheDocument();
  });

  it('shows 0% completion when no criteria are completed', () => {
    const incompleteCriteria = mockCriteria.map(c => ({ ...c, completed: false }));
    render(<JudgingCriteria criteria={incompleteCriteria} />);
    
    expect(screen.getByText('0 of 3 criteria addressed (0%)')).toBeInTheDocument();
  });

  it('does not toggle completion while in edit mode', async () => {
    const onUpdateCriteria = vi.fn();
    const user = userEvent.setup();
    
    render(
      <JudgingCriteria 
        criteria={mockCriteria} 
        onUpdateCriteria={onUpdateCriteria}
        canEdit={true} 
      />
    );
    
    await user.click(screen.getByText('Edit Criteria'));
    
    // Try to click on a criterion while in edit mode
    await user.click(screen.getByDisplayValue('Business Potential'));
    
    // Should not call onUpdateCriteria for completion toggle
    expect(onUpdateCriteria).not.toHaveBeenCalled();
  });
});