import { LocalStorage } from "node-localstorage";
import { stateStorageConfig } from "./globalConfig";

type MergeFunction<T> = (old: any | null, current: T) => any;
type State<T> = T & { save: (merge?: MergeFunction<T>) => void };
type StorageOption = { rootDir?: string; fileExt?: string; readable?: boolean };
type LoadOptions<T> = { defaultState?: T } & StorageOption;
type SaveOptions<T> = { merge?: MergeFunction<T> } & StorageOption;

export abstract class StateStorage {
  public static readonly DefaultDir =
    stateStorageConfig.defaultDir ?? "./states";
  public static readonly DefaultExt = stateStorageConfig.defaultExt ?? "";

  public static load<StateModel>(
    name: string,
    options?: LoadOptions<StateModel>
  ): State<StateModel> {
    const key = StateStorage.getKey(name, options);
    const defaultState = options?.defaultState || {};
    const storage = StateStorage.initStorage(name, options);

    const state = {
      save: (merge?: MergeFunction<StateModel>) =>
        StateStorage.saveState(storage, key, state, merge, options?.readable),
      ...StateStorage.loadState<StateModel>(storage, key, defaultState),
    } as ReturnType<typeof StateStorage.load<StateModel>>;

    return state;
  }

  public static save<StateModel>(
    name: string,
    state: StateModel,
    options?: SaveOptions<StateModel>
  ) {
    const key = StateStorage.getKey(name);
    const storage = StateStorage.initStorage(name, options);
    StateStorage.saveState(
      storage,
      key,
      state,
      options?.merge,
      options?.readable
    );
  }

  private static getKey(name: string, options?: StorageOption): string {
    return `${nameToKey(name)}${options?.fileExt || StateStorage.DefaultExt}`;
  }

  private static initStorage(name: string, options?: StorageOption) {
    return new LocalStorage(
      `${options?.rootDir || StateStorage.DefaultDir}${nameToDir(name)}`,
      25 * 1024 * 1024
    );
  }

  private static loadState<StateModel>(
    storage: LocalStorage,
    key: string,
    defaultVal: any
  ): StateModel {
    const raw = storage.getItem(key);
    const loaded = raw ? JSON.parse(raw) : null;
    return defaultVal && loaded
      ? Object.assign(defaultVal, loaded)
      : loaded || defaultVal;
  }

  private static saveState<StateModel>(
    storage: LocalStorage,
    key: string,
    state: StateModel,
    merge?: MergeFunction<StateModel>,
    readable?: boolean
  ) {
    storage.setItem(
      key,
      JSON.stringify(
        merge
          ? merge(StateStorage.loadState(storage, key, null), state)
          : state,
        null,
        readable ? 2 : undefined
      )
    );
  }
}

function nameToDir(name: string) {
  if (name.includes("/")) {
    const splited = name.split("/");
    splited.splice(-1, 1);
    return "/" + splited.join("/");
  } else {
    return "";
  }
}

function nameToKey(name: string): string {
  return name.split("/").pop() as string;
}

export default StateStorage;
