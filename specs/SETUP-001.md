# specs/SETUP-001.md

## Phase 1: Project Setup and Configuration (SETUP-001)

**Functional Requirements:**

1.  **Initialize Vite Project:** Set up a new Vite project with React 18 and TypeScript.
2.  **Configure TypeScript:** Configure `tsconfig.json` for strict type checking and project-specific settings.
3.  **Set up `.env` File:** Create a `.env` file to manage environment variables, including S3 credentials.
4.  **Configure S3 Bucket Connection:** Implement initial configuration to connect to the S3 bucket using provided credentials.
5.  **Project Structure:** Create the specified project directory structure.

**Edge Cases:**

1.  **Vite Initialization Failure:** Handle potential errors during Vite project setup.
2.  **TypeScript Configuration Errors:** Ensure `tsconfig.json` is correctly configured and handle any parsing or validation errors.
3.  **`.env` File Parsing Errors:** Handle cases where the `.env` file is not correctly parsed or environment variables are missing.
4.  **Invalid S3 Credentials:** Implement error handling for invalid or missing S3 credentials.
5.  **Directory Creation Failures:** Handle potential issues during directory creation due to permissions or existing files.

**Constraints:**

1.  **Use Vite, React 18, and TypeScript.**
2.  **Manage configuration via `.env` file.**
3.  **Use provided S3 credentials for initial setup.**
4.  **Adhere to the specified project structure.**

**Pseudocode:**

```pseudocode
// Module: project_setup.ts

// Function: initializeViteProject
// Initializes a new Vite project with React and TypeScript
function initializeViteProject(): Result<Success, Error> {
  // TDD Anchor: test_vite_project_initialization_success
  // TDD Anchor: test_vite_project_initialization_failure

  log("Initializing Vite project...");
  execute_command("npm create vite@latest mind-map-pwa -- --template react-ts");
  if (command_successful) {
    log("Vite project initialized successfully.");
    return Success;
  } else {
    log_error("Vite project initialization failed.");
    return Error("Vite project initialization failed.");
  }
}

// Function: configureTypeScript
// Configures tsconfig.json for strict type checking
function configureTypeScript(): Result<Success, Error> {
  // TDD Anchor: test_typescript_configuration_success
  // TDD Anchor: test_typescript_configuration_failure

  log("Configuring TypeScript...");
  read_file("tsconfig.json");
  update_tsconfig_content_with_strict_settings(tsconfig_content); // Placeholder for actual config update logic
  write_to_file("tsconfig.json", updated_tsconfig_content);
  if (file_write_successful) {
    log("TypeScript configured successfully.");
    return Success;
  } else {
    log_error("TypeScript configuration failed.");
    return Error("TypeScript configuration failed.");
  }
}

// Function: setupDotEnvFile
// Creates and sets up the .env file with S3 credentials
function setupDotEnvFile(): Result<Success, Error> {
  // TDD Anchor: test_dotenv_file_setup_success
  // TDD Anchor: test_dotenv_file_setup_failure

  log("Setting up .env file...");
  env_content = `
    VITE_S3_ENDPOINT=j6w1.fra.idrivee2-17.com
    VITE_S3_ACCESS_KEY_ID=Tx8oDhBv2wJBE53Gm8MY
    VITE_S3_SECRET_ACCESS_KEY=T2kk75sdteWkebzTekIwDT719kMgtygvzoZ7Ezq4
    VITE_S3_BUCKET_NAME=supabase-snacks-pets-backup
  `;
  write_to_file(".env", env_content);
  if (file_write_successful) {
    log(".env file setup successfully.");
    return Success;
  } else {
    log_error(".env file setup failed.");
    return Error(".env file setup failed.");
  }
}

// Function: configureS3Connection
// Implements initial S3 connection configuration (e.g., within a service)
function configureS3Connection(): Result<Success, Error> {
  // TDD Anchor: test_s3_connection_configuration_success
  // TDD Anchor: test_s3_connection_failure

  log("Configuring S3 connection...");
  create_directory("src/services");
  s3_service_content = `
    // src/services/s3Service.ts
    import AWS from 'aws-sdk';

    const s3 = new AWS.S3({
      endpoint: import.meta.env.VITE_S3_ENDPOINT,
      accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
    });

    export const listBuckets = async () => { // Example function to test connection
      try {
        const response = await s3.listBuckets().promise();
        console.log("S3 Buckets:", response.Buckets);
        return response.Buckets;
      } catch (error) {
        console.error("Error connecting to S3:", error);
        throw error;
      }
    };
  `;
  write_to_file("src/services/s3Service.ts", s3_service_content);
  if (file_write_successful) {
    log("S3 connection configured (initial setup).");
    return Success;
  } else {
    log_error("S3 connection configuration failed.");
    return Error("S3 connection configuration failed.");
  }
}

// Function: createProjectStructure
// Creates the specified project directory structure
function createProjectStructure(): Result<Success, Error> {
  // TDD Anchor: test_project_structure_creation_success
  // TDD Anchor: test_project_structure_creation_failure

  log("Creating project structure...");
  directories = ["src/components", "src/contexts", "src/hooks", "src/pages", "src/services", "src/styles", "src/utils", "public"];
  for each directory in directories {
    create_directory(directory);
    if (directory_creation_failed) {
      log_error("Failed to create directory: " + directory);
      return Error("Failed to create project structure.");
    }
  }
  files = ["src/App.tsx", "src/index.tsx", "src/serviceWorker.ts", "vite.config.ts", "tsconfig.json", "package.json", "README.md"];
  for each file in files {
    create_file(file); // Create empty files for now
    if (file_creation_failed) {
      log_error("Failed to create file: " + file);
      return Error("Failed to create project structure.");
    }
  }

  log("Project structure created.");
  return Success;
}


// Function: runSetupPhase1
// Orchestrates all setup steps for phase 1
function runSetupPhase1(): Result<Success, AggregateError> {
  log("Starting Phase 1 Setup: Project Setup and Configuration");
  results = [];

  result = initializeViteProject();
  results.push(result);
  if (result is Error) { log_error("Vite project initialization failed, stopping phase."); return AggregateError(results); }

  cd "mind-map-pwa"; // Change directory into the newly created project

  result = configureTypeScript();
  results.push(result);
  if (result is Error) { log_error("TypeScript configuration failed, stopping phase."); return AggregateError(results); }

  result = setupDotEnvFile();
  results.push(result);
  if (result is Error) { log_error(".env file setup failed, stopping phase."); return AggregateError(results); }

  result = configureS3Connection();
  results.push(result);
  if (result is Error) { log_error("S3 connection configuration failed, stopping phase."); return AggregateError(results); }

  result = createProjectStructure();
  results.push(result);
  if (result is Error) { log_error("Project structure creation failed, stopping phase."); return AggregateError(results); }


  if (all_results_successful(results)) {
    log("Phase 1 Setup: Project Setup and Configuration completed successfully.");
    return Success;
  } else {
    log_error("Phase 1 Setup: Project Setup and Configuration completed with errors.");
    return AggregateError(results);
  }
}

runSetupPhase1();