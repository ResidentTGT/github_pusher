type KnownEnv = {
	CB__StateStorage_DefaultDir: string;
	CB__StateStorage_DefaultExt: string;
};

const ENV = process.env as KnownEnv;

export const stateStorageConfig = {
	defaultDir: ENV.CB__StateStorage_DefaultDir,
	defaultExt: ENV.CB__StateStorage_DefaultExt,
};

export const globalConfig = {
	stateStorage: stateStorageConfig,
};

export default globalConfig;
