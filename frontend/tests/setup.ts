// Minimal test setup — silence module-registration noise
vi.spyOn(console, 'info').mockImplementation(() => {});
