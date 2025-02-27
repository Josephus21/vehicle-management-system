export function setItemWithExpiration(key, value, expirationHours, id, remember) {
  /* const now = new Date();
  const expirationTime = now.getTime() + expirationHours * 60 * 60 * 1000; */

  if (remember == true) {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem("id", JSON.stringify(id));
  } else if (remember == false) {
    sessionStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem("id", JSON.stringify(id));
  }
  // localStorage.setItem(`${key}_expire`, expirationTime.toString());
}

export function getItemWithExpiration(key) {
  const item = localStorage.getItem(key) || sessionStorage.getItem(key);
  /* const itemExpire = localStorage.getItem(`${key}_expire`);

  if (!item || !itemExpire) {
    return null;
  }

    const expirationTime = parseInt(itemExpire, 10);
  const currentTime = new Date().getTime(); 

  if (currentTime > expirationTime) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    localStorage.removeItem(`${key}_expire`);
    return null;
  }*/

  return JSON.parse(item);
}
