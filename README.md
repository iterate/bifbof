# bifbof is git-backed linear 

- run `bunx bifbof` to get started
- this runs a local server with a linear-like UI
- tasks are just markdown files with optional frontmatter (id, title, status, priority, dependencies)
- zero dependencies other than bun

# Why?

- Because opus 4.5 can one shot it! 
- I am a git maximalist. I like that I can see when each task was created etc 
- any coding agent can "refactor your backlog" without even knowing how this thing works
- markdown renders beautifully in many places
- can add any feature they want to their version of linear lite


# Things to add later

- CLI command that spits out instructions for agents
- CLI integrity checker that checks if any dependencies don't exist and responds with an LLM prompt on how to use git to find and fix the issue
- init command that sets up rules for coding agents
- plugins so people can customize it (or maybe they just shadcn install it because it's so small?)