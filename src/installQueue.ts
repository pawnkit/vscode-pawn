export class InstallQueue {
  private tail = Promise.resolve();

  run<T>(action: () => Promise<T>): Promise<T> {
    const previous = this.tail;
    let release!: () => void;
    this.tail = new Promise<void>((resolve) => { release = resolve; });
    return previous.then(async () => {
      try {
        return await action();
      } finally {
        release();
      }
    });
  }
}
