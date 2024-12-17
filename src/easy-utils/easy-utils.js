/*!
@language: en-US
@title: easy-utils.js
@description: Utility library for Easy Modules in Roll20. This module provides a collection of reusable utility 
	functions designed to simplify module development in the Roll20 API environment.
@author: Mhykiel
@version: 0.1.0
@license: MIT License
@repository: {@link https://github.com/Tougher-Together-Gaming/default-game-assets/tree/main/api-scripts/easy-lib-utility|GitHub Repository}
!*/

// eslint-disable-next-line no-unused-vars
const EASY_UTILS = (() => {

	/*******************************************************************************************************************
	 * SECTION: PRIVATE DATA
	 * 
	 * This section contains objects and data that are specific to this module and can be used by multiple functions.
	 * 
	 * - Think of this as a place to store shared settings, reusable values, or data that rarely changes.
	 * - By keeping these values in one place, you only need to update them here, and all the functions that use them
	 *   will automatically stay up to date.
	 ******************************************************************************************************************/

	// ANCHOR moduleSettings
	/**
	 * Default configuration for the Easy-LibUtils module.
	 */
	// eslint-disable-next-line no-unused-vars
	const moduleSettings = {
		modName: "Easy-Utils",
		chatName: "ezutils",
		globalName: "EASY_UTILS",
		version: "1.0.0",
		author: "Mhykiel",
		verbose: true,
	};

	const defaultSettings = {
		sharedVaultName: "EasyModuleVault",
		phraseLanguage: "enUS",
	};

	// !SECTION END of Private Data

	/*******************************************************************************************************************
	 * SECTION: UTILITY FUNCTIONS - Low Level
	 * 
	 * This section contains basic, reusable functions that perform small, specific tasks. 
	 * 
	 * - These functions are designed to support higher-level functions but can also be used on their own.
	 * - Low-level functions are **stateless**: they do not rely on or require `moduleSettings` from the calling module.
	 * - They should not throw errors. If something goes wrong, they should handle the issue quietly (e.g., return a
	 *   default value or log a warning) instead of crashing the program.
	 * - // NOTE `moduleSettings` is still included in the wrapper closure for consistency and for use with
	 *   logSyslogMessage, but are not required for the proper functioning of the low level utility.
	 ******************************************************************************************************************/

	/**
	 * @namespace functionLoaders
	 * 
	 * A collection of utility functions designed for Roll20 modules, built using closures for efficiency and
	 * flexibility. Functions under `functionLoaders` are not immediately ready to use. Instead, they are structured as 
	 * closures (functions that return other functions).
	 * This allows them to:
	 * - **Save Memory**: Functions are only created when requested, meaning they don't take up space until needed.
	 * - **Customize Behavior**: Each function is "wrapped" with the `moduleSettings` of the module requesting it, 
	 *   ensuring they behave specifically for that invoking module.
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
	 * @see https://dev.to/ahmedgmurtaza/use-closures-for-memory-optimizations-in-javascript-a-case-study-43h9
	 * 
	 * @example: 
	 * // Use to get a customized function instance.
	 * EASY_UTILS.getFunction('functionName', moduleSettings)
	 */
	const functionLoaders = {

		// ANCHOR Function: _logSyslogMessage
		/**
		 * @typedef {Object} _logSyslogMessage
		 * Logs messages in a syslog-like format, including severity, module name, tag, and additional message details.
		 * 
		 * This function is dynamically instantiated with `moduleSettings`, allowing each module to log messages 
		 * with its own context. The message is formatted to include severity, timestamp, module name, tag, message ID, and content.
		 *
		 * @example
		 * const logSyslogMessage = EASY_LIB_UTILS.getFunction('_logSyslogMessage', moduleSettings);
		 * 
		 * // Example: Translating and logging an error message
		 * const messageId = "40400"; // Corresponds to "Not Found: {{remark}}" in the PhraseFactory
		 * const translatedMessage = phraseFactory.getPhrase("enUS", messageId).replace("{{remark}}", "User");
		 * 
		 * logSyslogMessage({
		 *   severity: 4, // WARN
		 *   tag: "fetchUserDetails",
		 *   messageId: messageId,
		 *   message: translatedMessage
		 * });
		 * // Output: <WARN> 2024-12-16T14:45:12.003Z [MyModule](fetchUserDetails): {"messageId": 40400, "message": "Not Found: User"}
		 * 
		 * @param {Object} params - The log parameters.
		 * @param {number} params.severity - The severity level of the log (3 = ERROR, 4 = WARN, 6 = INFO, 7 = DEBUG). Defaults to 7 (DEBUG) if invalid.
		 * @param {string} params.tag - The function or component sending the log message. This helps in pinpointing the source of the log.
		 * @param {string} params.messageId - A unique identifier for the message. Should match an entry in the `PhraseFactory` for multilingual support.
		 * @param {string} params.message - The already translated message to log. Use the `PhraseFactory` to handle translation before calling this function.
		 * @returns {string} - The formatted log message.
		 */
		_logSyslogMessage: function () {
			return (moduleSettings) => {
				return ({ severity, tag, messageId, message }) => {
					const getSyslogTimestamp = () => { return new Date().toISOString(); };

					const severityMap = {
						7: "DEBUG",
						6: "INFO",
						4: "WARN",
						3: "ERROR",
					};

					// Default to DEBUG
					const normalizedSeverity = severityMap[severity] ? severity : 7;
					const moduleName = moduleSettings?.modName || "UNKNOWN_MODULE";
					const logMessage = `<${severityMap[normalizedSeverity]}> ${getSyslogTimestamp()} [${moduleName}](${tag}): {"messageId": ${messageId}, "message": "${message}"}`;
					log(logMessage);

					return logMessage;
				};
			};
		},

		// ANCHOR Function: _decodeNoteContent
		/**
		 * @typedef {Object} _decodeNoteContent
		 * Decodes an HTML-encoded string into plain, readable text.
		 *
		 * This function converts common HTML entities (e.g., `&lt;`, `&gt;`, `&nbsp;`) back into their plain text equivalents,
		 * including special characters, spaces, and line breaks. It is useful for processing HTML-encoded content, such as 
		 * Roll20 Notes, into clean, human-readable text.
		 *
		 * @example
		 * const decodeNoteContent = EASY_UTILS.getFunction("_decodeNoteContent", moduleSettings);
		 * const decodedText = decodeNoteContent({ text: "Hello&nbsp;&lt;World&gt;&nbsp;&amp;&nbsp;&#39;Friends&#39;" });
		 * log(decodedText);
		 * // Output: "Hello <World> & 'Friends'"
		 *
		 * @param {Object} params - The input parameters for decoding.
		 * @param {string} params.text - The HTML-encoded string to decode.
		 * @returns {string} - The plain text string with HTML entities converted.
		 */
		_decodeNoteContent: function () {
			return (moduleSettings) => {
				return ({ text }) => {
					if (typeof text !== "string") {

						if (moduleSettings.verbose) {

							/**
							 * @type _logSyslogMessage {@link _logSyslogMessage} Object
							 */
							const logSyslogMessage = EASY_UTILS.getFunction("_logSyslogMessage", moduleSettings);

							logSyslogMessage({
								severity: 7,
								tag: "_decodeNoteContent",
								messageId: "70000",
								message: "Invalid Argument: 'text' is not a string, returning input."
							});
						}

						// Gracefully handle non-string inputs
						return text;
					}

					return text
						.replace(/&lt;/g, "<")    // Decode <
						.replace(/&gt;/g, ">")    // Decode >
						.replace(/&quot;/g, "\"") // Decode "
						.replace(/&#39;/g, "'")   // Decode '
						.replace(/&nbsp;/g, " ")  // Decode non-breaking spaces
						.replace(/<br>/g, "\n")   // Decode line breaks
						.replace(/&amp;/g, "&");  // Decode & (must be done last to avoid double replacements)
				};
			};
		},

		// ANCHOR Function: _encodeNoteContent
		/**
		 * @typedef {Object} _encodeNoteContent
		 * Encodes an HTML-encoded string into plain, readable text.
		 *
		 * This function replaces special characters in a string (like `<`, `>`, `&`, and line breaks)
		 * with their respective HTML entities. It ensures that text is safely displayed in HTML contexts
		 * without being misinterpreted as HTML markup.
		 *
		 * @example
		 * const encodeNoteContent = EASY_UTILS.getFunction("_encodeNoteContent", moduleSettings);
		 * const encodedText = encodeNoteContent({ text: "Hello <World>\nIt's great & awesome!" });
		 * console.log(encodedText);
		 * // Output: "Hello&nbsp;&lt;World&gt;<br>It&#39;s&nbsp;great&nbsp;&amp;&nbsp;awesome!"
		 *
		 * @param {Object} params - The input parameters for encoding.
		 * @param {string} params.text - The plain text that needs to be encoded.
		 * @returns {string} - The HTML-encoded string where all special characters are safely replaced.
		 */
		_encodeNoteContent: function () {
			return (moduleSettings) => {
				return ({ text }) => {

					if (typeof text !== "string") {

						if (moduleSettings.verbose) {

							/**
							 * @type _logSyslogMessage {@link _logSyslogMessage} Object
							 */
							const logSyslogMessage = EASY_UTILS.getFunction("_logSyslogMessage", moduleSettings);
							logSyslogMessage({
								severity: 7,
								tag: "_encodeNoteContent",
								messageId: "70000",
								message: "Invalid Argument: 'text' is not a string, returning input."
							});
						}

						// Gracefully handle non-string inputs
						return text;
					}

					return text
						.replace(/&/g, "&amp;")   // Encode & (must be done first to avoid double replacements)
						.replace(/</g, "&lt;")    // Encode <
						.replace(/>/g, "&gt;")    // Encode >
						.replace(/"/g, "&quot;")  // Encode "
						.replace(/'/g, "&#39;")   // Encode '
						.replace(/ /g, "&nbsp;")  // Encode spaces as non-breaking
						.replace(/\n/g, "<br>");  // Encode newlines as <br>
				};
			};
		},

		// ANCHOR Function: _getSharedVault
		/**
		 * @typedef {Object} _getSharedVault
		 * Retrieves the persistent shared vault for Easy-Modules using Roll20's state object.
		 *
		 * The shared vault (`EasyModuleVault`) is used for storing persistent data across Roll20 sessions.
		 * If the vault does not already exist, it will be initialized as an empty object in the global `state`.
		 *
		 * @example
		 * const getSharedVault = EASY_LIB_UTILS.getFunction("_getSharedVault", moduleSettings);
		 * const sharedVault = getSharedVault();
		 * sharedVault.someKey = "someValue";
		 * log(sharedVault.someKey); // Output: "someValue"
		 *
		 * @returns {Object} - The persistent `EasyModuleVault` object stored in Roll20's `state`.
		 */
		_getSharedVault: function () {
			return (moduleSettings) => {
				return () => {
					const vaultName = defaultSettings.sharedVaultName;

					// Check if the vault exists in state
					if (!state[vaultName]) {

						state[vaultName] = {};

						if (moduleSettings.verbose) {
							/**
							 * @type _logSyslogMessage {@link _logSyslogMessage} Object
							 */
							const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);

							// Log the initialization
							logSyslogMessage({
								severity: 7,
								tag: "_getSharedVault",
								messageId: "70000",
								message: `Not Found: Shared vault undefined, initializing '${vaultName}' in Roll20 state.`,
							});
						}
					}

					return state[vaultName];
				};
			};
		},


		// ANCHOR Function: _makeCurryFunc
		/**
		 * @typedef {Object} _makeCurryFunc
		 * Creates a curried function that merges preset arguments with new arguments.
		 *
		 * A curried function allows you to "preload" some arguments and pass the remaining ones later. 
		 * This is useful for creating reusable functions with some arguments already fixed.
		 *
		 * ### Why is Currying Useful?
		 * - **Reusability**: You can predefine arguments to create specialized versions of a function.
		 * - **Simplifies Code**: You avoid repeatedly passing the same arguments.
		 * - **Flexibility**: You can handle arguments in stages, which makes code cleaner and more modular.
		 *
		 * @example
		 * // Target function: Adds three numbers
		 * const add = ({ a, b, c }) => a + b + c;
		 *
		 * // Create a curried version with preset arguments
		 * const curriedAdd = _makeCurryFunc({ func: add, presetArgs: { a: 1, b: 2 } });
		 *
		 * // Call the curried function with new arguments
		 * log(curriedAdd({ c: 3 })); // Output: 6
		 *
		 * @example
		 * // Overwrite preset arguments
		 * log(curriedAdd({ b: 5, c: 4 })); 
		 * // Output: 10 (new `b` overwrites the preset `b`)
		 *
		 * @param {Object} params - The parameters for creating the curried function.
		 * @param {Function} params.func - The target function to apply the arguments to.
		 * @param {Object} [params.presetArgs={}] - An object containing preset arguments for the function.
		 * @returns {Function} - A new function that accepts additional arguments (`laterArgs`) and calls the target function.
		 */
		_makeCurryFunc: function () {
			return (moduleSettings) => {
				return ({ func, presetArgs = {} }) => {
					if (typeof func !== "function") {

						if (moduleSettings.verbose) {
							/**
							 * @type _logSyslogMessage {@link _logSyslogMessage} Object
							 */
							const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);

							// Log the initialization
							logSyslogMessage({
								severity: 7,
								tag: "_makeCurryFunc",
								messageId: "70000",
								message: "Invalid Argument: 'fuc' is not a function; returning input.",
							});
						}

						return func;
					}

					return (laterArgs = {}) => {
						// Merge preset and later arguments, prioritizing later arguments
						return func({ ...presetArgs, ...laterArgs });
					};
				};
			};
		},

		// ANCHOR Function: _parseDataFromContent
		/**
		 * @typedef {Object} _parseDataFromContent
		 * Extracts JSON-like content from specific HTML `<div>` elements in a string.
		 *
		 * This function searches the provided `content` string for patterns matching a given `regexString`. 
		 * It returns all matching JSON or data strings found inside the `<div>` elements.
		 *
		 * @example
		 * const gmNotes = `<div id="data-container">{"key":"value1"}</div>`;
		 * const dataRegex = "<div id=\"data-container\">(.*?)</div>";
		 * const extractedData = _parseDataFromContent({ content: gmNotes, regexString: dataRegex });
		 * console.log(extractedData); // Output: ['{"key":"value1"}']
		 *
		 * @param {Object} params - Parameters for extracting data.
		 * @param {string} params.content - The HTML string to search for data.
		 * @param {string} params.regexString - A regular expression string to match `<div>` elements and their content.
		 * @returns {string[]} - An array of extracted content strings.
		 */
		_parseDataFromContent: function () {
			return (moduleSettings) => {
				return ({ content, regexString }) => {

					if (typeof content !== "string") {

						if (moduleSettings.verbose) {

							/**
							 * @type _logSyslogMessage {@link _logSyslogMessage} Object
							 */
							const logSyslogMessage = EASY_UTILS.getFunction("_logSyslogMessage", moduleSettings);
							logSyslogMessage({
								severity: 7,
								tag: "_parseDataFromContent",
								messageId: "70000",
								message: "Invalid Argument: 'content' is not a string, returning input."
							});
						}

						// Gracefully handle non-string inputs
						return content;
					}

					const regex = new RegExp(`${regexString}`, "gs");
					const matchesArray = [...content.matchAll(regex)];

					// Extract and return the matched content
					return matchesArray
						.map(match => { return match[1] || ""; })
						.filter(Boolean);
				};
			};
		},


		// ANCHOR Function: _parseChatCommands
		/**
		 * @typedef {Object} _parseChatCommands
		 * Parses commands and their arguments from a chat message.
		 *
		 * This function breaks down a chat message into commands and arguments using `--` as a delimiter.
		 * It returns a `Map` where each command is a key and its arguments are stored as an array.
		 *
		 * @example
		 * const commands = _parseChatCommands({ apiCallContent: "--menu option1 option2 --help" });
		 * log(commands);
		 * // Output: Map { "--menu" => ["option1", "option2"], "--help" => [] }
		 *
		 * @param {Object} params - Parameters for parsing chat commands.
		 * @param {string} params.apiCallContent - The full chat message containing commands and arguments.
		 * @returns {Map<string, string[]>} - A map of commands and their arguments.
		 */
		_parseChatCommands: function () {
			// eslint-disable-next-line no-unused-vars
			return (moduleSettings) => {
				return ({ apiCallContent }) => {
					const commandMap = new Map();

					// Normalize the input by trimming leading and trailing whitespace
					const normalizedContent = apiCallContent.trim();

					// Split the message into segments using '--' as a delimiter
					const segments = normalizedContent.split("--").filter(segment => { return segment.trim() !== ""; });

					// Process each segment
					segments.forEach((segment, index) => {
						// Skip the first segment if it's not a valid command (i.e., starts with '!')
						if (index === 0 && segment.trim().startsWith("!")) {
							return; // Skip this segment
						}

						// Trim the segment and split into command and arguments
						const trimmedSegment = segment.trim();
						const [command, ...args] = trimmedSegment.split(/\s+/);

						// Ensure the command has no leading or trailing whitespace
						const cleanCommand = command.toLowerCase().trim();

						// Store the command and its arguments in the map
						commandMap.set(`--${cleanCommand}`, args);
					});

					return commandMap;
				};
			};
		},

		// ANCHOR Function: _parseChatSubcommands
		/**
		 * @typedef {Object} _parseChatSubcommands
		 * Parses command arguments into key-value pairs or standalone flags.
		 *
		 * This function processes an array of arguments and identifies key-value pairs using `|` or `#` 
		 * as delimiters. Arguments without these delimiters are treated as standalone flags with a value of `true`.
		 *
		 * @example
		 * const parsedArgs = _parseChatSubcommands({ subcommands: ["key1|value1", "flag"] });
		 * console.log(parsedArgs); // Output: { key1: "value1", flag: true }
		 *
		 * @param {Object} params - Parameters for parsing subcommands.
		 * @param {string[]} params.subcommands - The array of arguments to parse.
		 * @returns {Object<string, string|boolean>} - A map of argument keys to their values or `true` for flags.
		 */
		_parseChatSubcommands: function () {
			// eslint-disable-next-line no-unused-vars
			return (moduleSettings) => {
				return ({ subcommands }) => {
					const subcommandMap = {};

					// Process each argument
					subcommands.forEach(arg => {
						// Check for key-value pair using | or #
						const delimiterMatch = arg.includes("|") ? "|" : arg.includes("#") ? "#" : null;

						if (delimiterMatch) {
							const [key, value] = arg.split(delimiterMatch);
							subcommandMap[key] = value; // Store key-value pair
						} else {
							subcommandMap[arg] = true; // Treat as a standalone flag
						}
					});

					return subcommandMap;
				};
			};
		},

		// ANCHOR Function: _purgeApiState
		/**
		 * @typedef {Object} _purgeApiState
		 * Clears a specific part of the Roll20 API state or the entire state if no key is provided.
		 * Optionally forces a sandbox restart after clearing the state.
		 *
		 * @example
		 * // Clear a specific sub-node
		 * const purgeApiState = EASY_LIB_UTILS.getFunction("_purgeApiState", moduleSettings);
		 * purgeApiState({ key: 'EasyModuleVault' });
		 *
		 * @example
		 * // Clear the entire state
		 * purgeApiState({});
		 *
		 * @example
		 * // Clear a specific sub-node without restarting
		 * purgeApiState({ key: 'EasyModuleVault', restart: false });
		 *
		 * @param {Object} params - Parameters for the state purge.
		 * @param {string} [params.key] - The specific key in the `state` object to purge. If not provided, clears the entire `state`.
		 * @param {boolean} [params.restart=false] - Whether to force a sandbox restart after purging the state.
		 * @returns {void}
		 */
		_purgeApiState: function () {
			// eslint-disable-next-line no-unused-vars
			return (moduleSettings) => {
				return ({ key, restart = false } = {}) => {
					if (key) {
						if (state[key]) {
							delete state[key]; // Delete the specified sub-node
						}
					} else {
						// Clear the entire state
						state = {};
						// log("Entire Roll20 API state has been cleared.");
					}

					// Optionally force a sandbox restart
					if (restart) {
						throw new Error("API sandbox restart triggered by _purgeApiState.");
					}
				};
			};
		},

		// ANCHOR Function: _replacePlaceholders
		/**
		 * @typedef {Object} _replacePlaceholders
		 * Replaces placeholders in a string with provided values or evaluated expressions.
		 *
		 * @example
		 * const input = {
		 *     string: `
		 *         Hello, {{name}}!
		 *         The sum is [[a + b]].
		 *         The background color is var(--bg-color).
		 *     `,
		 *     tokens: { name: "Alice", a: 5, b: 10 },
		 *     cssVars: { "--bg-color": "#00ff00" },
		 * };
		 *
		 * const result = _replacePlaceholders(input);
		 * console.log(result);
		 * // Output:
		 * // Hello, Alice!
		 * // The sum is 15.
		 * // The background color is #00ff00.
		 *
		 * @param {Object} input - Parameters for replacing placeholders.
		 * @param {string} input.string - The string containing placeholders.
		 * @param {Object} input.tokens - An object where keys match placeholders for string and expression replacements.
		 * @param {Object} [input.cssVars={}] - An optional object where keys match CSS variable placeholders.
		 * @returns {string} - The processed string with all placeholders replaced.
		 */
		_replacePlaceholders: function () {
			// eslint-disable-next-line no-unused-vars
			return (moduleSettings) => {
				return ({ string, tokens, cssVars = {} }) => {
					return string
						// Replace {{key}} placeholders
						.replace(/{{(.*?)}}/g, (_, key) => {
							return tokens[key.trim()] || "";
						})

						// Replace [[expression]] placeholders
						.replace(/\[\[(.*?)\]\]/g, (_, expression) => {
							try {
								const func = new Function(...Object.keys(tokens), `return ${expression.trim()};`);

								return func(...Object.values(tokens));
							} catch (e) {
								console.error(`Failed to evaluate expression: [[${expression.trim()}]]`, e);

								return `[[${expression.trim()}]]`; // Return the placeholder if evaluation fails
							}
						})

						// Replace var(--key) placeholders
						.replace(/var\((--[\w-]+)\)/g, (_, cssVar) => {
							return cssVars[cssVar.trim()] || `var(${cssVar.trim()})`;
						});
				};
			};
		},

		// ANCHOR Function: _whisperPlayerMessage
		/**
		 * @typedef {Object} _whisperPlayerMessage
		 * Sends a private (whispered) message to a specified player or GM.
		 *
		 * This function formats and sends a message using Roll20's `sendChat` API. It assumes that the recipient (`to`) 
		 * is already resolved to either "gm" or a player's name. The sender (`from`) can be customized or defaults 
		 * to the module name.
		 *
		 * ### Key Behavior:
		 * - If `from` is not provided, it defaults to the module's name.
		 * - If `to` is not provided, it defaults to "gm".
		 * - If an error occurs while sending the message, it logs an error and returns a failure status.
		 *
		 * ### When to Use:
		 * - Sending system or module messages privately to specific players or the GM.
		 * - Whispering alerts, updates, or notifications during game sessions.
		 *
		 * @example
		 * const whisperPlayerMessage = EASY_LIB_UTILS.getFunction("_whisperPlayerMessage", moduleSettings);
		 * whisperPlayerMessage({
		 *     from: "System",
		 *     to: "PlayerName",
		 *     message: "Hello, Player!"
		 * });
		 * // Sends: "/w PlayerName Hello, Player!"
		 *
		 * @param {Object} params - Parameters for the whisper message.
		 * @param {string} [params.from] - The sender's name or identifier. Defaults to the module's name.
		 * @param {string} [params.to="gm"] - The recipient's resolved name ("gm" or a player's name).
		 * @param {string} params.message - The message content to be whispered.
		 * @returns {number} - Returns `0` on success or `1` if an error occurs.
		 */
		_whisperPlayerMessage: function () {
			return (moduleSettings) => {
				return ({ from, to, message }) => {
					// Ensure sender has a default value
					const sender = from || moduleSettings.modName;

					// Ensure recipient has a default value
					const recipient = to || "gm";

					try {
						// Send the chat message using Roll20's sendChat API
						sendChat(sender, `/w ${recipient} ${message}`);

						return 0; // Success
					} catch (err) {
						const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);
						logSyslogMessage({
							severity: 3,
							tag: "_whisperPlayerMessage",
							messageId: "30000",
							message: `${err}`,
						});

						return 1; // Failure
					}
				};
			};
		},

		// ANCHOR Function: _convertCssToJson
		/**
 * @typedef {Object} _convertCssToJson
 * Converts a CSS string into a structured JSON format.
 *
 * Parses a CSS string, removes comments, and converts selectors and their styles into a 
 * JSON representation. Handles universal, element, class, ID, attribute, pseudo-class, 
 * and child selectors, organizing them for easy manipulation.
 *
 * ### Key Behavior:
 * - Processes and categorizes CSS selectors: universal (`*`), class (`.class`), ID (`#id`), 
 *   attributes (`[attr=value]`), pseudo-classes, and child selectors.
 * - Outputs a clean JSON format for use in dynamic style processing.
 *
 * @example
 * const css = `
 *   * { margin: 0; padding: 0; }
 *   .class > .child { color: red; }
 * `;
 * const cssJson = _convertCssToJson({ css });
 * console.log(JSON.parse(cssJson));
 *
 * @param {Object} params - Parameters for the conversion function.
 * @param {string} params.css - The CSS string to convert.
 * @returns {string} - Stringified JSON representation of CSS rules.
 */
		_convertCssToJson: function () {
			return (moduleSettings) => {
				return ({ css }) => {
					const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);

					const cleanedCSS = css
						.replace(/\/\*[\s\S]*?\*\//g, "")
						.replace(/\n/g, " ").trim();

					const cssRules = {
						universal: {},
						elements: {},
						classes: {},
						attributes: {},
						ids: {},
						functions: {},
					};

					const ruleRegex = /([^\{]+)\{([^\}]+)\}/g;
					const propertiesRegex = /([\w-]+)\s*:\s*([^;]+);/g;
					let match;

					try {
						while ((match = ruleRegex.exec(cleanedCSS))) {
							const selector = match[1].trim();
							const propertiesBlock = match[2].trim();
							const properties = {};
							let propMatch;

							while ((propMatch = propertiesRegex.exec(propertiesBlock))) {
								const key = propMatch[1].trim();
								const value = propMatch[2].trim();
								properties[key] = value;
							}

							selector.split(",").map(s => { return s.trim(); }).forEach(sel => {
								if (sel === "*") Object.assign(cssRules.universal, properties);
								else if (sel.startsWith(".")) cssRules.classes[sel] = { styles: properties };
								else if (sel.startsWith("#")) cssRules.ids[sel] = { styles: properties };
								else cssRules.elements[sel] = { styles: properties };
							});
						}

						const output = JSON.stringify(cssRules, null, 2);
						if (moduleSettings.verbose) {
							log(`_convertCssToJson: ${output}`);
						}

						return output;
					} catch (err) {
						logSyslogMessage({
							severity: 3,
							tag: "_convertCssToJson",
							messageId: "30000",
							message: `${err}`
						});

						return 1;
					}
				};
			};
		},

		// ANCHOR Function: _convertHtmlToJson
		/**
 * @typedef {Object} _convertHtmlToJson
 * Converts an HTML string into a structured JSON format.
 *
 * Parses an HTML string, building a hierarchical JSON representation with support for attributes 
 * such as `style`, `class`, and `id`. The output is a stringified JSON structure useful for applications 
 * requiring structured HTML data.
 *
 * ### Key Behavior:
 * - Converts opening tags, closing tags, and text nodes into structured JSON.
 * - Extracts attributes such as `class`, `style`, and `id`.
 * - Handles inline styles and breaks them into key-value pairs.
 * - Logs an error if unclosed tags are detected.
 *
 * @example
 * const html = `
 * <div class="container" style="color: red;">
 *   <p>Hello, <span id="highlight">world</span>!</p>
 * </div>`;
 *
 * const json = _convertHtmlToJson({ html });
 * console.log(JSON.parse(json));
 *
 * @param {Object} params - Parameters for the conversion function.
 * @param {string} params.html - The HTML string to convert.
 * @returns {string} - A stringified JSON representation of the HTML structure.
 */
		_convertHtmlToJson: function () {
			return (moduleSettings) => {
				return ({ html }) => {
					const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);

					// Regex to match both HTML tags and text nodes
					const regex = /<\/?\w+[^>]*>|[^<>]+/g;

					const elementsArray = html.match(regex)
						.map(item => { return item.trim(); })
						.filter(Boolean);

					const parseHTMLToJSON = (nodeArray) => {
						const stack = [];
						const root = { children: [] };
						stack.push(root);

						nodeArray.forEach(element => {
							const openingTagMatch = element.match(/^<(\w+)([^>]*)>$/);
							const closingTagMatch = element.match(/^<\/(\w+)>$/);

							if (openingTagMatch) {
								const [, tag, attributes] = openingTagMatch;
								const props = { style: {}, class: [], id: null, inlineStyle: {} };

								if (attributes) {
									const attributeRegex = /([\w-]+)\s*=\s*["']([^"']+)["']/g;
									let attrMatch;
									while ((attrMatch = attributeRegex.exec(attributes))) {
										const [, key, value] = attrMatch;

										if (key === "style") {
											const styleObject = {};
											value.split(";").forEach(style => {
												const [styleKey, styleValue] = style.split(":").map(s => { return s.trim(); });
												if (styleKey && styleValue) {
													styleObject[styleKey] = styleValue;
												}
											});
											props.inlineStyle = styleObject;
										} else if (key === "class") {
											props.class = value.split(" ").filter(Boolean);
										} else if (key === "id") {
											props.id = value;
										} else {
											props[key] = value;
										}
									}
								}

								const node = { element: tag, props, children: [], childIndex: 0 };
								const parent = stack[stack.length - 1];
								if (parent) {
									node.childIndex = parent.children.length + 1;
									parent.children.push(node);
								}
								stack.push(node);
							} else if (closingTagMatch) {
								stack.pop();
							} else {
								const textNode = {
									element: "text",
									children: [{ innerText: element.trim() }],
									childIndex: 0,
								};
								const parent = stack[stack.length - 1];
								if (parent) {
									textNode.childIndex = parent.children.length + 1;
									parent.children.push(textNode);
								}
							}
						});

						if (stack.length !== 1) {
							logSyslogMessage({
								severity: 3,
								tag: "_convertHtmlToJson",
								messageId: "50000",
								message: "Unclosed HTML tags detected during parsing."
							});
						}

						return root.children;
					};

					try {
						const output = JSON.stringify(parseHTMLToJSON(elementsArray), null, 2);
						if (moduleSettings.verbose) {
							log(`_convertHtmlToJson: ${output}`);
						}

						return output;
					} catch (err) {
						logSyslogMessage({
							severity: 3,
							tag: "_convertHtmlToJson",
							messageId: "30000",
							message: `${err}`
						});

						return 1;
					}
				};
			};
		},

		// ANCHOR Function: _convertJsonToHtml
		/**
 * @typedef {Object} _convertJsonToHtml
 * Converts a JSON representation of HTML into an HTML string.
 *
 * Recursively processes a JSON structure, generating equivalent HTML. Attributes, classes, 
 * IDs, and styles are converted into their respective HTML formats. Nested elements are 
 * handled hierarchically.
 *
 * ### Key Behavior:
 * - Converts JSON elements into HTML tags, handling `style`, `class`, and `id` attributes.
 * - Combines `style` and `inlineStyle`, prioritizing `inlineStyle` values.
 * - Recursively processes children to build a complete HTML structure.
 *
 * @example
 * const json = `
 * [
 *   {
 *     "element": "div",
 *     "props": { "style": { "color": "red" }, "class": ["container"] },
 *     "children": [
 *       {
 *         "element": "p",
 *         "props": {},
 *         "children": [ { "innerText": "Hello, World!" } ]
 *       }
 *     ]
 *   }
 * ]`;
 *
 * const html = _convertJsonToHtml({ htmlJson: json });
 * console.log(html);
 * // Output: <div class="container" style="color: red;"><p>Hello, World!</p></div>
 *
 * @param {Object} params - Parameters for the conversion function.
 * @param {string} params.htmlJson - The JSON string representing the HTML structure.
 * @returns {string} - The reconstructed HTML string.
 */
		_convertJsonToHtml: function () {
			return (moduleSettings) => {
				return ({ htmlJson }) => {
					const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);

					// Helper function to convert a style object into a CSS inline string
					function styleToString(styleObj) {
						return Object.entries(styleObj)
							.map(([key, value]) => {
								return `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`;
							})
							.join(" ");
					}

					// Recursive function to process each node in the JSON structure
					function processNode(node) {
						if (!node.element) return ""; // Return empty string if no element is defined

						if (node.element === "text") {
							return node.children && node.children[0]?.innerText ? node.children[0].innerText : "";
						}

						// Combine style and inlineStyle, prioritizing inlineStyle values
						const combinedStyle = { ...node.props?.style, ...node.props?.inlineStyle };
						const styleString = styleToString(combinedStyle);

						// Build an array of attributes for the HTML tag
						const attributes = [];
						if (styleString) attributes.push(`style="${styleString}"`);
						if (node.props?.class?.length) attributes.push(`class="${node.props.class.join(" ")}"`);
						if (node.props?.id) attributes.push(`id="${node.props.id}"`);

						Object.keys(node.props || {})
							.filter(key => { return !["style", "inlineStyle", "class", "id"].includes(key); })
							.forEach(key => { return attributes.push(`${key}="${node.props[key]}"`); });

						// Recursively process children
						const childrenHtml = (node.children || []).map(processNode).join("");

						return `<${node.element} ${attributes.join(" ")}>${childrenHtml}</${node.element}>`;
					}

					try {
						const json = JSON.parse(htmlJson);
						const output = json.map(processNode).join("");

						if (moduleSettings.verbose) {
							log(`_convertJsonToHtml: ${output}`);
						}

						return output;
					} catch (err) {
						logSyslogMessage({
							severity: 3,
							tag: "_convertJsonToHtml",
							messageId: "30000",
							message: `${err}`
						});

						return 1;
					}
				};
			};
		},

		// ANCHOR Function: _applyCssToHtmlJson
		/**
 * @typedef {Object} _applyCssToHtmlJson
 * Applies CSS rules to an HTML JSON structure as inline styles.
 *
 * This function processes CSS and HTML JSON inputs, resolving styles in the following precedence:
 * Universal > Element > Class > ID > Inline. It supports child-specific and `:nth-child` styles, 
 * as well as CSS variable resolution.
 *
 * ### Key Behavior:
 * - Resolves CSS rules and applies them as inline styles to an HTML JSON structure.
 * - Supports `:root` variables, child-specific rules, and `:nth-child` pseudo-classes.
 * - Merges styles based on precedence while preserving user-defined inline styles.
 *
 * @example
 * const cssJson = `
 * {
 *   "universal": { "margin": "0" },
 *   "elements": { "div": { "color": "blue" } },
 *   "classes": { ".highlight": { "background": "yellow" } },
 *   "ids": { "#unique": { "border": "1px solid black" } }
 * }`;
 *
 * const htmlJson = `
 * [
 *   {
 *     "element": "div",
 *     "props": { "class": ["highlight"], "id": "unique" },
 *     "children": [{ "element": "span", "props": {}, "children": [] }]
 *   }
 * ]`;
 *
 * const styledHtmlJson = _applyCssToHtmlJson({ cssJson, htmlJson });
 * console.log(JSON.parse(styledHtmlJson));
 *
 * @param {Object} params - Parameters for applying CSS.
 * @param {string|Object} params.cssJson - CSS rules as a JSON string or object.
 * @param {string|Object} params.htmlJson - HTML structure as a JSON string or object.
 * @returns {string} - The updated HTML JSON with inline styles applied.
 */
		_applyCssToHtmlJson: function () {
			return (moduleSettings) => {
				return ({ cssJson, htmlJson }) => {
					const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);

					try {
						const cssRules = typeof cssJson === "string" ? JSON.parse(cssJson) : cssJson;
						const htmlStructure = typeof htmlJson === "string" ? JSON.parse(htmlJson) : htmlJson;

						// Extract CSS variables defined in the `:root` section
						const cssVariables = {};
						if (cssRules.functions && cssRules.functions[":root"]) {
							cssRules.functions[":root"].forEach(entry => {
								Object.assign(cssVariables, entry.styles);
							});
						}

						function resolveCssVariables(value) {
							if (typeof value === "string") {
								return value.replace(/var\((--[a-zA-Z0-9-]+)\)/g, (_, variable) => {
									return cssVariables[variable] || `var(${variable})`;
								});
							}

							return value;
						}

						function mergeStyles(existingStyles, newStyles, inlineStyles = {}) {
							for (const [key, value] of Object.entries(newStyles)) {
								const resolvedValue = resolveCssVariables(value);
								if (resolvedValue.includes("!important")) {
									inlineStyles[key] = resolvedValue;
								} else if (!(key in inlineStyles)) {
									existingStyles[key] = resolvedValue;
								}
							}

							return existingStyles;
						}

						function getStylesForElement(element, props, node, parent) {
							let styles = {};
							if (cssRules.universal) styles = mergeStyles(styles, cssRules.universal, props.inlineStyle);
							if (cssRules.elements && cssRules.elements[element]) {
								styles = mergeStyles(styles, cssRules.elements[element].styles || {}, props.inlineStyle);
							}
							if (parent && cssRules.elements?.[parent.element]?.children?.[element]) {
								styles = mergeStyles(styles, cssRules.elements[parent.element].children[element].styles || {}, props.inlineStyle);
							}
							const classList = props.class || [];
							classList.forEach(cls => {
								if (cssRules.classes?.[`.${cls}`]) {
									styles = mergeStyles(styles, cssRules.classes[`.${cls}`].styles || {}, props.inlineStyle);
								}
							});
							if (props.id) {
								const idKey = `#${props.id}`;
								if (cssRules.ids?.[idKey]) {
									styles = mergeStyles(styles, cssRules.ids[idKey].styles || {}, props.inlineStyle);
								}
							}

							return styles;
						}

						function applyStylesRecursively(node, parent = null) {
							if (Array.isArray(node)) {
								node.forEach(child => { return applyStylesRecursively(child, parent); });
							} else if (typeof node === "object" && node !== null) {
								const element = node.element;
								const props = node.props || {};
								props.inlineStyle = props.inlineStyle || {};
								const computedStyles = getStylesForElement(element, props, node, parent);
								props.style = { ...computedStyles };
								const children = node.children || [];
								applyStylesRecursively(children, node);
							}
						}

						applyStylesRecursively(htmlStructure);
						const output = JSON.stringify(htmlStructure, null, 2);
						if (moduleSettings.verbose) {
							log(`_applyCssToHtmlJson: ${output}`);
						}

						return output;
					} catch (err) {
						logSyslogMessage({
							severity: 3,
							tag: "_applyCssToHtmlJson",
							messageId: "30000",
							message: `${err}`
						});

						return 1;
					}
				};
			};
		},

		// ANCHOR Function: _convertToSingleLine
		/**
 * @typedef {Object} _convertToSingleLine
 * Converts a multiline string into a single-line string while preserving quoted text.
 *
 * This function replaces all whitespace with single spaces, except for quoted text (single or double quotes),
 * which remains unchanged. It ensures clean, single-line strings while maintaining readability of quoted content.
 *
 * ### Key Behavior:
 * - Replaces all sequences of whitespace with a single space.
 * - Preserves text within single (`'`) or double (`"`) quotes.
 *
 * @example
 * const convertToSingleLine = EASY_LIB_UTILS.getFunction("_convertToSingleLine", moduleSettings);
 * const singleLine = convertToSingleLine({ multiline: "This is \n a 'test of \nquotes'." });
 * console.log(singleLine); 
 * // Output: "This is a 'test of \nquotes'."
 *
 * @param {Object} params - Parameters for the function.
 * @param {string} params.multiline - The multiline string to convert.
 * @returns {string} - The resulting single-line string.
 */
		_convertToSingleLine: function () {
			// eslint-disable-next-line no-unused-vars
			return (moduleSettings) => {
				return ({ multiline }) => {
					const regex = /("[^"]*"|'[^']*')|\s+/g;

					return multiline.replace(regex, (_, quoted) => {
						return quoted ? quoted : " "; // Preserve quoted text; replace other matches with a single space.
					});
				};
			};
		},



		// !SECTION End of Utility Functions: Low Level

		/***************************************************************************************************************
		 * SECTION: UTILITY FUNCTIONS - High Level
		 *
		 * This section contains essential, reusable functions that handle complex tasks and module-level operations.
		 *
		 * - High-level functions use lower-level utilities.
		 * - These functions may rely on `moduleSettings` for context and configuration specific to the calling module.
		 * - High-level functions should attempt to fall back to default values or configurations when issues arise.
		 * - If a fallback is not possible and the outcome remains erroneous, they should log the issue and throw an
		 *   error to the Roll20 API to ensure proper debugging and system stability.
		 *******************************************************************************************************************/

		// ANCHOR Function: _createPhraseFactory
		/**
 * @typedef {Object} _createPhraseFactory
 * Creates a factory for managing localized phrases.
 *
 * This factory initializes phrases for the currently set language and provides methods
 * to retrieve, add, update, and remove phrases. It also supports dynamic content with placeholders.
 * Phrases are organized per language and stored in the shared vault.
 *
 * ### Key Features:
 * - Supports multiple languages with a fallback to a default language.
 * - Provides player-specific language preferences stored in Roll20's shared vault.
 * - Dynamically replaces placeholders in phrases.
 *
 * @returns {Object} - A factory object with methods for managing localized phrases.
 */
		_createPhraseFactory: function () {
			return (moduleSettings) => {
				const defaultLanguage = moduleSettings?.phraseLanguage || "enUS";

				const defaultPhrases = {
					enUS: {
						"0": "Success",
						"1": "Failure",
						"10000": ".=> Initializing <=.",
						"20000": ".=> Complete <=.",
						"20100": "{{remark}} has been created.",
						"40000": "Invalid Arguments: {{remark}}",
						"40400": "Not Found: {{remark}}",
						"50000": "Error: {{remark}}",
						"30000": "Warning: {{remark}}",
						"60000": "Information: {{remark}}",
						"70000": "Debug: {{remark}}",
						"0x0CBDE1DE": "Error: Failure parsing HTML. Verify HTML is well formed with nested opening and closing tags.",
						"0x026DAC9E": "Not Found: Could not find '{{aRequestedFunc}}' available from {{globalName}}.",
						"0x081AD87E": "Invalid Arguments: When adding new phrases, 'language' must be a string and 'newPhrases' an object.",
						"0x0E9FE4D0": "Invalid Arguments: When adding new phrases, '{{key}}' must be a string.",
					},
					frFR: {
						"0": "Succès",
						"1": "Échec",
						"10000": ".=> Initialisation <=.",
						"20000": ".=> Terminé <=.",
						"20100": "{{remark}} a été créé.",
						"40000": "Arguments invalides : {{remark}}",
						"40400": "Introuvable : {{remark}}",
						"50000": "Erreur : {{remark}}",
						"30000": "Avertissement : {{remark}}",
						"60000": "Information : {{remark}}",
						"70000": "Débogage : {{remark}}",
					},
				};

				const l10n = {};
				const phraseConfigKey = "PhraseConfig";

				const getSharedVault = EASY_LIB_UTILS.getFunction("_getSharedVault", moduleSettings);
				const replacePlaceholders = EASY_LIB_UTILS.getFunction("_replacePlaceholders", moduleSettings);

				function getPlayerLanguage(playerId) {
					const vault = getSharedVault();

					return vault[phraseConfigKey]?.playerPreferedLanguage?.[playerId] || defaultLanguage;
				}

				function setPlayerLanguage(playerId, language) {
					const vault = getSharedVault();
					if (!vault[phraseConfigKey]) {
						vault[phraseConfigKey] = { playerPreferedLanguage: {} };
					}
					vault[phraseConfigKey].playerPreferedLanguage[playerId] = language;
				}

				return {
					/**
			 * Initializes the phrase factory.
			 * Loads default phrases and player-specific language preferences.
			 */
					init: () => {
						const vault = getSharedVault();
						const languages = Object.keys(defaultPhrases);
						languages.forEach((lang) => {
							l10n[lang] = { ...defaultPhrases[lang] };
						});

						if (!vault[phraseConfigKey]) {
							vault[phraseConfigKey] = { playerPreferedLanguage: {} };
						}
					},

					/**
			 * Retrieves a localized phrase for the player.
			 * @param {Object} params - Parameters for fetching the phrase.
			 * @param {string} params.playerId - Roll20 player ID.
			 * @param {string} params.code - The phrase code.
			 * @param {Object} [params.args={}] - Placeholder arguments.
			 * @returns {string} - The localized phrase.
			 */
					get: ({ playerId, code, args = {} }) => {
						const language = getPlayerLanguage(playerId);
						const currentLangPhrases = l10n[language] || {};
						const fallbackLangPhrases = l10n[defaultLanguage] || {};
						const template = currentLangPhrases[code] || fallbackLangPhrases[code];

						return typeof template === "string" ? replacePlaceholders(template, args) : code;
					},

					/**
			 * Changes the language preference for a player.
			 * @param {string} playerId - The Roll20 player ID.
			 * @param {string} newLanguage - The language code to set.
			 */
					changeLanguage: (playerId, newLanguage) => {
						if (!defaultPhrases[newLanguage]) {
							log(`[PhraseFactory] Language '${newLanguage}' is not available.`);

							return;
						}
						setPlayerLanguage(playerId, newLanguage);
						log(`[PhraseFactory] Player '${playerId}' language set to '${newLanguage}'.`);
					},

					/**
			 * Adds new phrases to a language.
			 * @param {Object} params - Parameters for adding phrases.
			 * @param {string} params.language - The language code.
			 * @param {Object} params.newPhrases - Phrases to add.
			 */
					add: ({ language, newPhrases }) => {
						if (!language || typeof newPhrases !== "object" || newPhrases === null) {
							throw new Error("Invalid parameters: 'language' must be a string and 'newPhrases' an object.");
						}
						l10n[language] = { ...l10n[language], ...newPhrases };
					},

					/**
			 * Removes a specific phrase from a language.
			 * @param {Object} params - Parameters for removing phrases.
			 * @param {string} params.language - The language code.
			 * @param {string} params.code - The phrase code to remove.
			 */
					remove: ({ language, code }) => {
						if (l10n[language]) {
							delete l10n[language][code];
						}
					},
				};
			};
		},

		// ANCHOR Function: _createTemplateFactory
		/**
 * @typedef {Object} _createTemplateFactory
 * Creates a factory for managing reusable templates.
 *
 * This factory initializes with default templates and provides methods to retrieve, add, update, 
 * and remove templates. Templates can dynamically generate structured content with placeholders.
 *
 * ### Key Features:
 * - Retrieve templates and populate placeholders dynamically.
 * - Add, update, or remove templates.
 * - Reinitialize with default templates as needed.
 *
 * @example
 * const templateFactory = _createTemplateFactory(moduleSettings);
 * const tableTemplate = templateFactory.get({ template: "default", content: { key: "value" } });
 * console.log(tableTemplate); // Outputs the default template as a single-line string.
 *
 * @returns {Object} - A factory object with methods to manage templates.
 */
		_createTemplateFactory: function () {
			return (moduleSettings) => {
				const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);
				const replacePlaceholders = EASY_LIB_UTILS.getFunction("_replacePlaceholders", moduleSettings);

				const defaultTemplateMap = {
					"default": "[\n{\"element\": \"table\",\"props\": {\"style\": {},\"class\": [],\"id\": null,\"inlineStyle\": {\"border-collapse\": \"collapse\",\"width\": \"50%\"},\"border\": \"1\"},\"children\": [\n{\"element\": \"thead\",\"props\": {\"style\": {},\"class\": [],\"id\": null,\"inlineStyle\": {}},\"children\": [\n{\"element\": \"tr\",\"props\": {\"style\": {},\"class\": [],\"id\": null,\"inlineStyle\": {}},\"children\": [\n{\"element\": \"th\",\"props\": {\"style\": {},\"class\": [],\"id\": null,\"inlineStyle\": {\"padding\": \"8px\",\"text-align\": \"left\"}},\"children\": [\n{\"element\": \"text\",\"children\": [\n{\"innerText\": \"Key\"}\n],\"childIndex\": 1}\n],\"childIndex\": 1},\n{\"element\": \"th\",\"props\": {\"style\": {},\"class\": [],\"id\": null,\"inlineStyle\": {\"padding\": \"8px\",\"text-align\": \"left\"}},\"children\": [\n{\"element\": \"text\",\"children\": [\n{\"innerText\": \"Value\"}\n],\"childIndex\": 1}\n],\"childIndex\": 2}\n],\"childIndex\": 1}\n],\"childIndex\": 1},\n{\"element\": \"tbody\",\"props\": {\"style\": {},\"class\": [],\"id\": null,\"inlineStyle\": {}},\"children\": [\n${tableRows}\n],\"childIndex\": 2}\n]\n]\n}",
					"chatAlert": "[\n{\"element\": \"div\",\"props\": {\"style\": {},\"class\": [\"alert-message\"],\"id\": null,\"inlineStyle\": {}},\"children\": [\n{\"element\": \"h3\",\"props\": {},\"children\": [\n{\"element\": \"text\",\"children\": [\n{\"innerText\": \"${title}\"}\n],\"childIndex\": 1}\n]},\n{\"element\": \"p\",\"props\": {},\"children\": [\n{\"element\": \"text\",\"children\": [\n{\"innerText\": \"${description}\"}\n],\"childIndex\": 1}\n]},\n{\"element\": \"div\",\"props\": {\"class\": [\"alert-command\"]},\"children\": [\n{\"element\": \"p\",\"props\": {},\"children\": [\n{\"element\": \"text\",\"children\": [\n{\"innerText\": \"${command}\"}\n],\"childIndex\": 1}\n]}\n]},\n{\"element\": \"p\",\"props\": {},\"children\": [\n{\"element\": \"text\",\"children\": [\n{\"innerText\": \"${remark}\"}\n],\"childIndex\": 1}\n]}\n]\n}\n]"
				};

				const templates = {};

				return {
					/** Reinitializes the factory with default templates. */
					init: () => {
						Object.assign(templates, defaultTemplateMap);
					},

					/**
			 * Retrieves a template by name, populating it with content if provided.
			 * @param {Object} params - Options for retrieving the template.
			 * @param {string} [params.template="default"] - The template name.
			 * @param {Object} [params.content={}] - Data to populate the template.
			 * @returns {string} - The rendered template string.
			 */
					get: ({ template = "default", content = {} }) => {
						const templateString = templates[template] || templates["default"];

						return replacePlaceholders({ template: templateString, content });
					},

					/**
			 * Replaces current templates with a new set.
			 * @param {Object} params - Parameters for setting templates.
			 * @param {Object<string, string>} params.newMap - New template map.
			 */
					set: ({ newMap }) => {
						Object.keys(templates).forEach(key => { return delete templates[key]; });
						Object.assign(templates, newMap);
					},

					/**
			 * Adds or updates templates.
			 * @param {Object} params - Parameters for adding templates.
			 * @param {Object<string, string>} params.newTemplates - Templates to add or update.
			 */
					add: ({ newTemplates }) => {
						if (typeof newTemplates !== "object" || newTemplates === null) {
							logSyslogMessage({ severity: 3, tag: "_createTemplateFactory", messageId: "40000", message: "Invalid template map provided." });

							return;
						}
						Object.entries(newTemplates).forEach(([name, templateString]) => {
							if (typeof templateString !== "string") {
								logSyslogMessage({ severity: 3, tag: "_createTemplateFactory", messageId: "40000", message: `Template '${name}' must be a string.` });

								return;
							}
							templates[name] = templateString;
						});
					},

					/**
			 * Removes a template by name.
			 * @param {Object} params - Options for removing the template.
			 * @param {string} params.template - The name of the template to remove.
			 */
					remove: ({ template }) => {
						delete templates[template];
					},
				};
			};
		},

		// ANCHOR Function: _createThemeFactory
		/**
 * @typedef {Object} _createThemeFactory
 * Creates a factory for managing reusable themes.
 *
 * This factory initializes with default themes and provides methods to retrieve, add, update, 
 * and remove themes. Themes define CSS styles for elements, classes, or IDs and are dynamically 
 * generated for flexibility.
 *
 * ### Key Features:
 * - Retrieve themes dynamically, passing color palettes for customization.
 * - Add, update, or remove themes.
 * - Reinitialize with default themes when necessary.
 *
 * @example
 * const themeFactory = _createThemeFactory(moduleSettings);
 * const theme = themeFactory.get({ theme: "default", palette: { bgColor: "#f0f0f0", titleColor: "#333" } });
 * console.log(theme); // Outputs the theme as a single-line string.
 *
 * @returns {Object} - A factory object with methods to manage themes.
 */
		_createThemeFactory: function () {
			return (moduleSettings) => {
				const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);
				const convertToSingleLine = EASY_LIB_UTILS.getFunction("_convertToSingleLine", moduleSettings);
				const phraseFactory = EASY_LIB_UTILS.getFunction("_createPhraseFactory", moduleSettings);

				const defaultThemes = {
					"default": () => {
						return `{
                    "universal": {},
                    "elements": {},
                    "classes": {},
                    "attributes": {},
                    "functions": {},
                    "ids": {}
                }`;
					},
					"chatAlert": ({ bgColor, titleColor }) => {
						return `{
                    "universal": {},
                    "elements": {
                        "h3": {
                            "styles": {
                                "color": "var(--alert-title-color)",
                                "margin": "0",
                                "font-size": "1.2em"
                            },
                            "children": {}
                        },
                        "p": {
                            "styles": {
                                "margin": "0",
                                "overflow-wrap": "break-word"
                            },
                            "children": {}
                        }
                    },
                    "classes": {
                        ".alert-message": {
                            "styles": {
                                "border": "1px solid black",
                                "background-color": "var(--alert-bg)",
                                "padding": "5px 10px",
                                "border-radius": "10px"
                            },
                            "children": {}
                        },
                        ".alert-command": {
                            "styles": {
                                "margin": "8px 0",
                                "padding": "5px",
                                "background-color": "var(--alert-command-bg)",
                                "border": "var(--alert-command-border)",
                                "border-radius": "5px",
                                "font-family": "monospace"
                            },
                            "children": {}
                        }
                    },
                    "functions": {
                        ":root": [{
                            "target": null,
                            "args": [],
                            "styles": {
                                "--alert-bg": "${bgColor}",
                                "--alert-title-color": "${titleColor}",
                                "--alert-command-bg": "#ffffff",
                                "--alert-command-border": "1px solid #cccccc"
                            }
                        }]
                    },
                    "ids": {}
                }`;
					},
				};

				const themes = {};

				return {
					/** Reinitializes the factory with default themes. */
					init: () => {
						Object.assign(themes, defaultThemes);
					},

					/**
			 * Retrieves a theme by name, generating CSS with optional palettes.
			 * @param {Object} params - Options for retrieving the theme.
			 * @param {string} [params.theme="default"] - The theme name.
			 * @param {Object} [params.palette={}] - Color palette for customization.
			 * @returns {string} - The generated theme string.
			 */
					get: ({ theme = "default", palette = {} }) => {
						const cssGenerator = themes[theme] || themes["default"];
						const themeString = cssGenerator(palette);

						return convertToSingleLine({ multiline: themeString });
					},

					/**
			 * Replaces all current themes with a new set.
			 * @param {Object} params - Parameters for setting themes.
			 * @param {Object<string, Function>} params.newMap - New theme map.
			 */
					set: ({ newMap }) => {
						Object.keys(themes).forEach(key => { return delete themes[key]; });
						Object.assign(themes, newMap);
					},

					/**
			 * Adds or updates themes.
			 * @param {Object} params - Parameters for adding themes.
			 * @param {Object<string, Function>} params.newThemes - Themes to add or update.
			 */
					add: ({ newThemes }) => {
						if (typeof newThemes !== "object" || newThemes === null) {
							logSyslogMessage({ severity: 3, tag: "_createThemeFactory", messageId: "40000", message: phraseFactory().get({ code: "0x0A8E5CFE" }) });

							return;
						}
						Object.entries(newThemes).forEach(([name, themeFunction]) => {
							if (typeof themeFunction !== "function") {
								logSyslogMessage({ severity: 3, tag: "_createThemeFactory", messageId: "40000", message: phraseFactory().get({ code: "0x0AA3C5BE", args: { name } }) });

								return;
							}
							themes[name] = themeFunction;
						});
					},

					/**
			 * Removes a theme by name.
			 * @param {Object} params - Options for removing the theme.
			 * @param {string} params.theme - The name of the theme to remove.
			 */
					remove: ({ theme }) => {
						delete themes[theme];
					},
				};
			};
		},

		// ANCHOR Function: _renderTemplate
		/**
 * @typedef {Object} _renderTemplate
 * Renders a template with a given theme and data.
 *
 * This function retrieves a specified template and theme, applies the theme's styles to the template, 
 * injects the provided content, and generates a fully rendered HTML string with inline styles.
 *
 * ### Key Behavior:
 * - Retrieves the template and theme concurrently.
 * - Applies theme styles as inline CSS to the template JSON.
 * - Converts the styled template JSON into an HTML string.
 *
 * @example
 * const renderedHtml = await _renderTemplate({
 *   template: "default",
 *   theme: "default",
 *   content: { key1: "value1", key2: "value2" },
 *   palette: { primaryColor: "#007bff" }
 * });
 * console.log(renderedHtml); // Outputs rendered and styled HTML as a string.
 *
 * @param {Object} options - Options for rendering the template.
 * @param {string} options.template - The name of the template to render.
 * @param {Object} options.content - Data to inject into the template.
 * @param {string} options.theme - The name of the theme to apply.
 * @param {Object} [options.palette={}] - Optional palette for dynamic theme customization.
 * @returns {Promise<string>} - The rendered HTML string.
 */
		_renderTemplate: function () {
			return (moduleSettings) => {
				const templateFactory = EASY_LIB_UTILS.getFunction("_createTemplateFactory", moduleSettings)();
				const themeFactory = EASY_LIB_UTILS.getFunction("_createThemeFactory", moduleSettings)();
				const applyCssToHtmlJson = EASY_LIB_UTILS.getFunction("_applyCssToHtmlJson", moduleSettings);
				const convertJsonToHtml = EASY_LIB_UTILS.getFunction("_convertJsonToHtml", moduleSettings);

				return async ({ template, content, theme, palette = {} }) => {
					try {
						const [fetchedTemplate, fetchedTheme] = await Promise.all([
							templateFactory.get({ template, content }),
							themeFactory.get({ theme, palette })
						]);

						const styledJson = applyCssToHtmlJson({
							cssJson: fetchedTheme,
							htmlJson: fetchedTemplate
						});

						return convertJsonToHtml({ htmlJson: styledJson });
					} catch (err) {
						const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);
						logSyslogMessage({
							severity: 3,
							tag: "_renderTemplate",
							messageId: "30000",
							message: `${err}`
						});

						return "";
					}
				};
			};
		},

		// ANCHOR Function: _whisperAlertMessage
		/**
 * @typedef {Object} _whisperAlertMessage
 * Sends a styled alert message in chat to a specified player.
 *
 * This function formats and whispers an alert message (e.g., tip, warning, or error) to the player. 
 * It integrates with templates, themes, and the PhraseFactory for localized and styled output.
 *
 * ### Key Behavior:
 * - Supports four severity levels: TIP, INFO, WARNING, and ERROR.
 * - Dynamically applies themes and palettes to format the alert message.
 * - Whispers the rendered message to the recipient using `_whisperPlayerMessage`.
 *
 * @param {Object} params - Parameters for the alert message.
 * @param {string} params.from - The sender's name.
 * @param {string} params.to - The recipient's name.
 * @param {number|string} params.severity - Severity level (e.g., 3 for ERROR, "INFO").
 * @param {string} params.title - The title of the alert.
 * @param {string} params.description - A description of the alert.
 * @param {string} [params.remark] - Additional contextual remark for the alert.
 * @returns {Promise<number>} - Returns `0` on success or `1` if an error occurs.
 */
		_whisperAlertMessage: function () {
			return (moduleSettings) => {
				const renderTemplate = EASY_LIB_UTILS.getFunction("_renderTemplate", moduleSettings);
				const whisperPlayerMessage = EASY_LIB_UTILS.getFunction("_whisperPlayerMessage", moduleSettings);
				const encodeNoteContent = EASY_LIB_UTILS.getFunction("_encodeNoteContent", moduleSettings);
				const logSyslogMessage = EASY_LIB_UTILS.getFunction("_logSyslogMessage", moduleSettings);

				return async ({ from, to, severity, title, description, remark }) => {
					const severityEnum = {
						TIP: { code: 7, bgColor: "#C3FDB8", titleColor: "#16F529" },
						INFO: { code: 6, bgColor: "#b8defd", titleColor: "#2516f5" },
						WARNING: { code: 4, bgColor: "#FBE7A1", titleColor: "#CA762B" },
						ERROR: { code: 3, bgColor: "#ffdddd", titleColor: "red" },
					};

					const severityLookup = Object.entries(severityEnum).reduce((lookup, [key, value]) => {
						lookup[value.code] = value;
						lookup[key.toLowerCase()] = value;

						return lookup;
					}, {});

					const normalizedSeverity = typeof severity === "string" ? severity.toLowerCase() : severity;
					const alertConfig = severityLookup[normalizedSeverity] || severityEnum.INFO;

					const alertContent = {
						title: title.toUpperCase(),
						description: encodeNoteContent({ text: description }),
						remark: encodeNoteContent({ text: remark })
					};

					const alertPalette = {
						bgColor: alertConfig.bgColor,
						titleColor: alertConfig.titleColor,
					};

					try {
						const styledMessage = await renderTemplate({
							template: "chatAlert",
							content: alertContent,
							theme: "chatAlert",
							palette: alertPalette,
						});

						whisperPlayerMessage({ from, to, message: styledMessage });

						return 0;
					} catch (err) {
						logSyslogMessage({
							severity: 3,
							tag: "_whisperAlertMessage",
							messageId: "30000",
							message: `${err}`
						});

						return 1;
					}
				};
			};
		},

		// !SECTION End of Utility Functions: High Level
	};

	const loadedFunctions = {};

	return {

		/**
		 * Dynamically retrieves a utility function and embeds the moduleSettings.
		 *
		 * @template T
		 * @param {string} functionName - Name of the utility function to retrieve.
		 * @param {Object} moduleSettings - The module settings of the caller.
		 * @returns {T} - The requested function with its type information.
		 */
		getFunction: (functionName, moduleSettings) => {
			if (!functionLoaders[functionName]) {
				throw new Error(`EASY_UTILS: Function "${functionName}" not found.`);
			}

			if (!loadedFunctions[functionName]) {
				loadedFunctions[functionName] = functionLoaders[functionName]();
			}

			// Wrap the function with the moduleSettings
			if (typeof loadedFunctions[functionName] === "function") {
				return loadedFunctions[functionName](moduleSettings);
			}

			// Return non-function utilities (e.g., PhraseFactory) as is
			return loadedFunctions[functionName];
		},
	};
})();
