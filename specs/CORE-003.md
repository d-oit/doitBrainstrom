# specs/CORE-003.md

## Phase 3: Core Functionality Development (CORE-003)
**Functional Requirements:**

1.  **Mind Map Node Creation:** Implement functionality to create nodes in the mind map. Nodes should be draggable, resizable, and support multilingual content.
2.  **Node Linking:** Allow users to link nodes together to represent relationships in the mind map, with support for directional indicators in RTL layouts.
3.  **Node Editing:** Enable users to edit the content (text) of each node with full multilingual text support.
4.  **Mind Map Data Model:** Define a data model to represent the mind map structure, including nodes, links, and language-specific content.
5.  **State Management:** Implement state management to handle the mind map data, UI state, and language preferences.
6.  **Internationalization Support:** Ensure all mind map features support internationalization, including RTL layouts and multilingual content.
5.  **State Management:** Implement state management to handle the mind map data and UI state.

**Edge Cases:**

1.  **Node Creation Errors:** Handle errors during node creation, such as invalid input or state conflicts, with localized error messages.
2.  **Linking Errors:** Manage errors when linking nodes, including invalid link targets or circular dependencies, supporting RTL link directions.
3.  **Editing Errors:** Handle errors during node content editing, such as data validation or saving issues, with proper handling of different character sets.
4.  **Data Model Inconsistencies:** Ensure data model integrity and handle potential inconsistencies across different languages.
5.  **State Management Issues:** Address state update problems, race conditions, or performance bottlenecks in state management, including language switches.
6.  **Drag and Resize Issues:** Handle edge cases during node drag and resize operations, considering RTL layouts and variable text lengths.
7.  **Font Loading Issues:** Handle cases where language-specific fonts fail to load or are not available.
8.  **Text Direction Conflicts:** Resolve conflicts between node content direction and overall layout direction.

**Constraints:**

1.  **Use React 18 for component implementation.**
2.  **Implement mind map functionality with node creation, linking, and editing.**
3.  **Define a suitable data model for mind maps with i18n support.**
4.  **Implement state management (e.g., using Context API, Zustand, or Recoil).**
5.  **Support RTL and LTR text directions in nodes and overall layout.**
6.  **Enable storage and retrieval of multilingual content.**

**Pseudocode:**

```pseudocode
// Module: core_functionality.ts

// Data Model Definitions
interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // ... other node properties
}

interface MindMapLink {
  id: string;
  sourceId: string;
  targetId: string;
  // ... other link properties
}

interface MindMapData {
  nodes: MindMapNode[];
  links: MindMapLink[];
}


// State Management Setup (Conceptual - using Context API for example)
// Create MindMapContext, Provider, and useMindMap hook (similar to ThemeContext from UI-002)


// Function: createMindMapNode
// Creates a new mind map node
function createMindMapNode(text: string, x: number, y: number): Result<MindMapNode, Error> {
  // Vitest test example:
  // describe('createMindMapNode', () => {
  //   it('should create a node successfully with valid input', () => {
  //     const result = createMindMapNode('Test Node', 100, 100);
  //     expect(result.isSuccess()).toBe(true);
  //     expect(result.value.text).toBe('Test Node');
  //   });
  //   it('should fail with invalid input', () => {
  //     const result = createMindMapNode('', -1, -1);
  //     expect(result.isError()).toBe(true);
  //   });
  // });

  log("Creating mind map node...");
  if (invalid_input(text)) {
    log_error("Invalid node text input.");
    return Error("Invalid node text input.");
  }

  node = {
    id: generate_unique_id(),
    text: text,
    x: x,
    y: y,
    width: 200, // default width
    height: 100, // default height
    // ... initialize other properties
  };
  update_mind_map_state(add_node_to_state(node)); // Assuming state management function
  log("Mind map node created.");
  return Success(node);
}

// Function: linkMindMapNodes
// Links two mind map nodes
function linkMindMapNodes(sourceNodeId: string, targetNodeId: string): Result<MindMapLink, Error> {
  // Vitest test example:
  // describe('linkMindMapNodes', () => {
  //   it('should link nodes successfully with valid IDs', () => {
  //     const result = linkMindMapNodes('node1', 'node2');
  //     expect(result.isSuccess()).toBe(true);
  //     expect(result.value.sourceId).toBe('node1');
  //   });
  //   it('should fail with invalid node IDs', () => {
  //     const result = linkMindMapNodes('invalid', 'invalid');
  //     expect(result.isError()).toBe(true);
  //   });
  // });

  log("Linking mind map nodes...");
  if (invalid_node_id(sourceNodeId) || invalid_node_id(targetNodeId)) {
    log_error("Invalid source or target node ID.");
    return Error("Invalid source or target node ID.");
  }
  if (nodes_already_linked(sourceNodeId, targetNodeId)) {
    log("Nodes already linked.");
    return Error("Nodes already linked."); // Or Success if idempotent
  }


  link = {
    id: generate_unique_id(),
    sourceId: sourceNodeId,
    targetId: targetNodeId,
    // ... initialize other link properties
  };
  update_mind_map_state(add_link_to_state(link)); // Assuming state management function
  log("Mind map nodes linked.");
  return Success(link);
}

// Function: editMindMapNodeText
// Edits the text content of a mind map node
function editMindMapNodeText(nodeId: string, newText: string): Result<MindMapNode, Error> {
  // Vitest test example:
  // describe('editMindMapNodeText', () => {
  //   it('should edit node text successfully with valid input', () => {
  //     const result = editMindMapNodeText('node1', 'Updated Text');
  //     expect(result.isSuccess()).toBe(true);
  //     expect(result.value.text).toBe('Updated Text');
  //   });
  //   it('should fail with invalid node ID', () => {
  //     const result = editMindMapNodeText('invalid', 'text');
  //     expect(result.isError()).toBe(true);
  //   });
  // });

  log("Editing mind map node text...");
  if (invalid_node_id(nodeId)) {
    log_error("Invalid node ID for editing.");
    return Error("Invalid node ID for editing.");
  }
  if (invalid_input(newText)) { // Validate newText if needed
    log_error("Invalid new text input.");
    return Error("Invalid new text input.");
  }

  updated_node = get_node_from_state(nodeId); // Assuming state management function to get node
  if (updated_node) {
    updated_node.text = newText;
    update_mind_map_state(update_node_in_state(updated_node)); // Assuming state management function
    log("Mind map node text edited.");
    return Success(updated_node);
  } else {
    log_error("Node not found for editing.");
    return Error("Node not found for editing.");
  }
}

// Function: implementMindMapComponent
// Implements the main MindMap React component (using a library like react-flow-renderer or similar, or canvas)
function implementMindMapComponent(): Result<Success, Error> {
  // Vitest test example:
  // describe('MindMapComponent', () => {
  //   it('should render successfully', () => {
  //     const { container } = render(<MindMap />);
  //     expect(container).toBeDefined();
  //   });
  //   it('should handle errors during initialization', () => {
  //     // Test error cases during component initialization
  //   });
  // });

  log("Implementing MindMap component...");
  mind_map_component_content = `
    // src/components/MindMap.tsx
    import React from 'react';
    // import ReactFlow from 'react-flow-renderer'; // Example using react-flow-renderer (or use Canvas)
    import MindMapCard from './MindMapCard'; // Using the Card component from UI-002

    const MindMap: React.FC = () => {
      // State and logic for mind map rendering and interaction would go here
      // Example using static data for now
      const initialNodes = [
        { id: '1', data: { label: <MindMapCard title="Node 1" description="Description for Node 1" /> }, position: { x: 50, y: 50 } },
        { id: '2', data: { label: <MindMapCard title="Node 2" description="Description for Node 2" /> }, position: { x: 300, y: 50 } },
      ];
      // const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]; // Example edges if using react-flow-renderer


      return (
        <div>
          {/* Example using divs and MindMapCard - replace with actual mind map rendering logic */}
          {initialNodes.map((node) => (
            <div key={node.id} style={{ position: 'absolute', top: node.position.y, left: node.position.x }}>
              {node.data.label}
            </div>
          ))}
          {/* Edges/Links rendering logic would go here */}
        </div>
      );
    };

    export default MindMap;
  `;
  write_to_file("src/components/MindMap.tsx", mind_map_component_content);
  if (file_write_successful) {
    log("MindMap component implemented (basic structure).");
    return Success;
  } else {
    log_error("MindMap component implementation failed.");
    return Error("MindMap component implementation failed.");
  }
}

// Function: setupMindMapStateManagement
// Sets up state management for the mind map (using Context API example)
function setupMindMapStateManagement(): Result<Success, Error> {
  // Vitest test example:
  // describe('MindMapStateManagement', () => {
  //   it('should initialize state management successfully', () => {
  //     const { result } = renderHook(() => useMindMap());
  //     expect(result.current).toBeDefined();
  //   });
  //   it('should handle state management errors', () => {
  //     // Test error cases in state management
  //   });
  // });

  log("Setting up MindMap state management (Context API)...");
  mind_map_context_content = `
    // src/contexts/MindMapContext.tsx
    import React, { createContext, useState, useContext } from 'react';
    import { MindMapData, MindMapNode, MindMapLink } from '../utils/ MindMapDataModel'; // Assuming data model defined in utils

    interface MindMapContextProps {
      mindMapData: MindMapData;
      createNode: (text: string, x: number, y: number) => void;
      linkNodes: (sourceId: string, targetId: string) => void;
      editNodeText: (nodeId: string, newText: string) => void;
      // ... other state management functions
    }

    const MindMapContext = createContext<MindMapContextProps | undefined>(undefined);

    export const MindMapContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [mindMapData, setMindMapData] = useState<MindMapData>({ nodes: [], links: [] });

      const createNode = (text: string, x: number, y: number) => {
        // ... implementation to create a node and update state
        console.log("Create Node:", text, x, y); // Placeholder
      };

      const linkNodes = (sourceId: string, targetId: string) => {
        // ... implementation to link nodes and update state
        console.log("Link Nodes:", sourceId, targetId); // Placeholder
      };

      const editNodeText = (nodeId: string, newText: string) => {
        // ... implementation to edit node text and update state
        console.log("Edit Node Text:", nodeId, newText); // Placeholder
      };


      const value: MindMapContextProps = {
        mindMapData,
        createNode,
        linkNodes,
        editNodeText,
        // ... other functions
      };

      return (
        <MindMapContext.Provider value={value}>
          {children}
        </MindMapContext.Provider>
      );
    };

    export const useMindMap = () => {
      const context = useContext(MindMapContext);
      if (!context) {
        throw new Error('useMindMap must be used within a MindMapContextProvider');
      }
      return context;
    };
  `;
  mind_map_data_model_content = `
    // src/utils/MindMapDataModel.ts
    export interface MindMapNode {
      id: string;
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      // ... other node properties
    }

    export interface MindMapLink {
      id: string;
      sourceId: string;
      targetId: string;
      // ... other link properties
    }

    export interface MindMapData {
      nodes: MindMapNode[];
      links: MindMapLink[];
    }
  `;
  create_directory("src/contexts");
  create_directory("src/utils");
  write_to_file("src/contexts/MindMapContext.tsx", mind_map_context_content);
  write_to_file("src/utils/MindMapDataModel.ts", mind_map_data_model_content);

  if (file_write_successful) { // Assuming both writes are successful
    log("MindMap state management setup (Context API).");
    return Success;
  } else {
    log_error("MindMap state management setup failed.");
    return Error("MindMap state management setup failed.");
  }
}


// Function: runSetupPhase3
// Orchestrates all setup steps for phase 3
function runSetupPhase3(): Result<Success, AggregateError> {
  log("Starting Phase 3 Setup: Core Functionality Development");
  results = [];

  result = setupMindMapStateManagement();
  results.push(result);
  if (result is Error) { log_error("MindMap state management setup failed, stopping phase."); return AggregateError(results); }

  result = implementMindMapComponent();
  results.push(result);
  if (result is Error) { log_error("MindMap component implementation failed, stopping phase."); return AggregateError(results); }


  log("Phase 3 Setup: Core Functionality Development - basic structure completed.");
  return Success; // Basic structure complete, further implementation needed in code mode
}

runSetupPhase3();