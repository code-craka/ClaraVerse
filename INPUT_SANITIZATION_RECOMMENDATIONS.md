# Input Sanitization Recommendations

Input sanitization is a critical security practice to prevent various types of injection attacks and ensure that data processed by the application is safe and in the expected format.

## Frontend (React)

**1. Rendering User-Generated HTML Content:**

*   **Risk:** If your application needs to render HTML content that originates from users or untrusted sources (e.g., a rich text editor's output, content fetched from an external API that might contain HTML), directly rendering it using `dangerouslySetInnerHTML` can expose your application to Cross-Site Scripting (XSS) attacks.
*   **Recommendation:** Use a library like `DOMPurify` to sanitize HTML content before rendering. `DOMPurify` will strip out any potentially malicious code (like `<script>` tags or `onerror` attributes) while preserving safe HTML formatting.

    **Installation:**
    ```bash
    npm install dompurify
    # or
    yarn add dompurify
    ```

    **Example Usage:**
    ```tsx
    import DOMPurify from 'dompurify';

    const UserGeneratedContent = ({ htmlContent }) => {
      // Sanitize the HTML content
      const cleanHtml = DOMPurify.sanitize(htmlContent);

      return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
    };
    ```
    *   **Configuration:** `DOMPurify` can be configured to allow specific tags and attributes if needed, providing a balance between security and functionality.

**2. General Input Fields:**

*   While React inherently escapes content rendered as text (e.g., `{data}` in JSX), be mindful when data is used in other contexts:
    *   **URLs:** Ensure URLs are correctly encoded, especially if parts of them come from user input (e.g., `encodeURIComponent`).
    *   **Props passed to other libraries:** If user input is passed to third-party libraries or native browser APIs, understand how those libraries/APIs handle the data and whether sanitization or escaping is needed on your part.

## Backend (Python/Node.js/Electron Main)

**1. Database Interactions (Preventing SQL Injection):**

*   **Risk:** Constructing SQL queries by directly concatenating strings with user input can lead to SQL injection vulnerabilities, allowing attackers to manipulate your database.
*   **Recommendations:**
    *   **Use an ORM (Object-Relational Mapper):** Libraries like SQLAlchemy (Python), Prisma (Node.js/TypeScript), Sequelize (Node.js), or TypeORM (Node.js/TypeScript) typically handle SQL sanitization by default when using their query builder methods. They encourage using objects and methods to build queries rather than raw SQL strings.
        ```python
        # Example with SQLAlchemy (Python)
        from sqlalchemy import text
        # User input
        user_id = "123"
        # Parameterized query
        result = session.execute(text("SELECT * FROM users WHERE id = :user_id"), {"user_id": user_id})
        ```
    *   **Parameterized Queries (Prepared Statements):** If not using an ORM, or when raw SQL is necessary, always use parameterized queries (also known as prepared statements). Most database drivers provide this capability. The database driver then handles proper escaping of the input.
        ```python
        # Example with sqlite3 (Python)
        import sqlite3
        conn = sqlite3.connect('example.db')
        cursor = conn.cursor()
        # User input
        user_name = "O'Malley"
        # Parameterized query
        cursor.execute("SELECT * FROM users WHERE name = ?", (user_name,))
        ```
        ```javascript
        // Example with node-postgres (Node.js)
        const { Pool } = require('pg');
        const pool = new Pool();
        // User input
        const userName = "O'Malley";
        // Parameterized query
        pool.query('SELECT * FROM users WHERE name = $1', [userName], (err, res) => { /* ... */ });
        ```

**2. Filesystem Interactions:**

*   **Risk:** User input used to construct file paths can lead to path traversal attacks, allowing attackers to access or modify unintended files.
*   **Recommendations:**
    *   **Validate and Sanitize Paths:** Use functions like `path.normalize()` and `path.basename()` to canonicalize paths.
    *   **Allowlisting:** If possible, only allow access to specific, known directories or file patterns.
    *   **Avoid User-Controlled Path Segments:** Do not directly use user input to form parts of a path without rigorous validation.

**3. Command Execution:**

*   **Risk:** If user input is used to construct shell commands, it can lead to command injection.
*   **Recommendations:**
    *   **Avoid `shell: true`:** In Node.js `child_process.spawn` or `exec`, avoid using the `shell: true` option if user input is involved.
    *   **Argument Arrays:** Pass commands and arguments as an array to `spawn` or similar functions, rather than a single string. This way, user input is treated as a single argument, not interpreted by the shell.
        ```javascript
        // Safer
        spawn('ls', ['-alh', userInput]);
        // Risky if userInput is not sanitized
        // exec(`ls -alh ${userInput}`);
        ```

**4. Data Sent to External APIs:**

*   **Risk:** Sending unsanitized user input to external APIs might lead to issues if that API has vulnerabilities or if the data is later displayed to other users.
*   **Recommendations:**
    *   Validate data against the expected format/schema before sending.
    *   Encode data appropriately (e.g., JSON encoding, URL encoding for query parameters).

By consistently applying these input sanitization principles, you can significantly reduce the attack surface of your application.
