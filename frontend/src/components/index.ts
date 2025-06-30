// Streamlined component exports - core modules only
export * from './auth';
export * from './layout';
export * from './ui';
export * from './features';
export * from './profile';
export * from './effects';

// Remove redundant exports:
// - home/* merged into features/*
// - data/* merged into features/*
// - interactive/* merged into ui/*
// - utils/* merged into ui/*
// - icons/* consolidated
// - skeletons/* merged into ui/*