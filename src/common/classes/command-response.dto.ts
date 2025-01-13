export class CommandResponseDto<T> {
  code: string; // Code = 0 mean success
  message?: string;
  data?: T;

  static success<T>(data: T) {
    const result = new CommandResponseDto<T>();
    result.data = data;
    return result;
  }
}
