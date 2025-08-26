---
description: 'Description of the custom chat mode.'
tools: ['editFiles', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'extensions', 'codebase', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'findTestFiles', 'searchResults', 'githubRepo', 'todos']
model: GPT-4.1
---
請將 ${input:msg} 的內容根據 #file:copilot-commit-message-instructions.md 的規範，生成一個適合用於 git commit 的訊息，並且符合以下要求：
1. 使用中文撰寫
2. 以 markdown 格式回覆
3. 回覆內容只包含 commit 訊息，請勿包含其他文字說明