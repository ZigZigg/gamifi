export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    if (data === undefined || data === null) {
      return null;
    }
    return parseFloat(data);
  }
}
