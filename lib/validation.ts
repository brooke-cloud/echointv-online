// 获取安全字符串
export function getFormString(
  formData: FormData,
  name: string,
  maxLength: number
) {
  const value =
    String(
      formData.get(name) ??
      ""
    ).trim();

  if (
    value.length > maxLength
  ) {
    throw new Error(
      `${name} is too long.`
    );
  }

  return value;
}