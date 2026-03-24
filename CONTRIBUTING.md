# Contributing to LoricaMaris

Thank you for your interest in LoricaMaris! We welcome contributions from the community to help make AI-generated apps more stable and accessible.

## Code Terms & Standards

1. **Security First**: Never commit sensitive information (APIs, tokens, local paths) to the repository. Use `.env.example` as a template for new configuration requirements.
2. **SDK Compliance**: All changes to the SDK or core engine must maintain compatibility with the LoricaMaris V2 specification (see `skills/game-creation/SKILL.md`).
3. **Drafting Games**: If adding example games, place them in the `examples/` directory and ensure they include a `manifest.json`, `definition.json`, and `logic.js`.
4. **Testing**: Run `npm run build` before submitting a pull request to ensure no regression in the Next.js build or Prisma schema.

## Getting Started

1. Fork the repository.
2. Clone your fork locally.
3. Create a new branch for your feature or fix.
4. Commit your changes with descriptive messages.
5. Push to your fork and submit a Pull Request.

## License

By contributing to LoricaMaris, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
