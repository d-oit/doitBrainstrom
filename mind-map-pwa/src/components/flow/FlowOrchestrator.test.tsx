// src/components/flow/FlowOrchestrator.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlowOrchestrator from './FlowOrchestrator';
import { VersionedStateManager } from '../../utils/versioning/VersionedStateManager';

// Mock dependencies
vi.mock('./ReactFlowAdapter', () => ({
  default: ({ stateManager, onNodeClick, onEdgeClick }: any) => (
    <div data-testid="mock-react-flow-adapter">
      <button onClick={() => onNodeClick({ id: 'test-node', data: { label: 'Test Node' } })}>
        Click Node
      </button>
      <button onClick={() => onEdgeClick({ id: 'test-edge', source: 'node1', target: 'node2' })}>
        Click Edge
      </button>
    </div>
  )
}));

vi.mock('../../utils/versioning/VersionedStateManager', () => {
  const mockAddNode = vi.fn().mockImplementation(() => ({
    id: 'new-node',
    type: 'mindMapCard',
    position: { x: 100, y: 100 },
    data: { title: 'New Node' }
  }));
  
  const mockUndo = vi.fn().mockReturnValue(true);
  
  return {
    VersionedStateManager: vi.fn().mockImplementation(() => ({
      loadState: vi.fn().mockResolvedValue(true),
      getState: vi.fn().mockReturnValue({
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        versionVector: new Map()
      }),
      addNode: mockAddNode,
      undo: mockUndo
    }))
  };
});

vi.mock('../../contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key // Simple mock that returns the key
  })
}));

vi.mock('../../contexts/ResponsiveContext', () => ({
  useResponsive: () => ({
    viewport: {
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true
    }
  })
}));

describe('FlowOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders without crashing', async () => {
    render(<FlowOrchestrator />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check for toolbar buttons
    expect(screen.getByText('actions.addNode')).toBeInTheDocument();
    expect(screen.getByText('actions.undo')).toBeInTheDocument();
    expect(screen.getByText('actions.save')).toBeInTheDocument();
    
    // Check for ReactFlowAdapter
    expect(screen.getByTestId('mock-react-flow-adapter')).toBeInTheDocument();
  });
  
  it('handles add node button click', async () => {
    const user = userEvent.setup();
    render(<FlowOrchestrator />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click add node button
    await user.click(screen.getByText('actions.addNode'));
    
    // Check if addNode was called
    const mockStateManager = VersionedStateManager as unknown as vi.Mock;
    expect(mockStateManager.mock.instances[0].addNode).toHaveBeenCalled();
    
    // Check for success notification
    await waitFor(() => {
      expect(screen.getByText('notifications.nodeAdded')).toBeInTheDocument();
    });
  });
  
  it('handles undo button click', async () => {
    const user = userEvent.setup();
    render(<FlowOrchestrator />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click undo button
    await user.click(screen.getByText('actions.undo'));
    
    // Check if undo was called
    const mockStateManager = VersionedStateManager as unknown as vi.Mock;
    expect(mockStateManager.mock.instances[0].undo).toHaveBeenCalled();
    
    // Check for success notification
    await waitFor(() => {
      expect(screen.getByText('notifications.actionUndone')).toBeInTheDocument();
    });
  });
  
  it('handles save button click', async () => {
    const mockOnSave = vi.fn();
    const user = userEvent.setup();
    render(<FlowOrchestrator onSave={mockOnSave} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click save button
    await user.click(screen.getByText('actions.save'));
    
    // Check if onSave was called
    expect(mockOnSave).toHaveBeenCalled();
    
    // Check for success notification
    await waitFor(() => {
      expect(screen.getByText('notifications.saved')).toBeInTheDocument();
    });
  });
  
  it('handles node click', async () => {
    const user = userEvent.setup();
    render(<FlowOrchestrator />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click a node
    await user.click(screen.getByText('Click Node'));
    
    // No specific assertion needed as we're just testing that it doesn't crash
    // In a real test, we might check for state changes or side effects
  });
  
  it('respects readOnly prop', async () => {
    const user = userEvent.setup();
    render(<FlowOrchestrator readOnly={true} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check that buttons are disabled
    expect(screen.getByText('actions.addNode')).toBeDisabled();
    expect(screen.getByText('actions.undo')).toBeDisabled();
    
    // Save button should still be enabled
    expect(screen.getByText('actions.save')).not.toBeDisabled();
  });
});
