export async function saveTxtToGoogleDrive(element) {
  const uploadUrl =
    "https://script.google.com/macros/s/AKfycbzxAmUKqd_Jdz3rba2Yy_iX7f3H00rjv5UgOb7glvUkCgYBX2nouG9TH8kGgObiM7pg/exec";
  const fileName = element.name;
  const content = JSON.stringify(element, null, 2);
  const match = localStorage.getItem("savedURL").match(/\/folders\/([^/?]+)/);
  const folderId = match ? match[1] : null;

  if (folderId !== null) {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        folderId: folderId,
        fileName: fileName,
        content: content,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      alert(`Upload failed: ${result.error}`);
    }
  }
}

export async function saveImgToGoogleDrive(name, gateName) {
  const uploadUrl =
    "https://script.google.com/macros/s/AKfycbzoi8w9JJHmQqDkuO4oIDYDPk9Wv2POMtkr6ZlJ5ylonssx5RPMwBG0mXHTlWkOUw49cw/exec";
  const match = localStorage.getItem("savedURL").match(/\/folders\/([^/?]+)/);
  const folderId = match ? match[1] : null;
  if (folderId !== null) {
    try {
      // Завантажуємо зображення як Blob
      const response = await fetch(name);
      if (!response.ok) {
        alert(`Failed to fetch image: ${response.statusText}`);
        return null;
      }
      const blob = await response.blob();

      // Читаємо Blob як Base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // Видалити префікс
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      // Відправляємо запит на завантаження
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          folderId: folderId,
          fileName: gateName,
          fileData: base64Data,
        }),
      });

      const result = await uploadResponse.json();
      if (result.success) {
        const match = result.fileUrl.match(/\/d\/([^/]+)/);
        if (match && match[1]) {
          const fileId = match[1];
          return `https://lh3.google.com/u/0/d/${fileId}`;
        } else {
          alert("Invalid Google Drive link format.");
        }
      } else {
        alert(`Upload failed: ${result.error}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching or uploading static image:", error);
      alert("Failed to fetch or upload static image. See console for details.");
      return null;
    }
  }
}

export async function loadFromGoogleDrive() {
  const webAppUrl =
    "https://script.google.com/macros/s/AKfycbxTOOhKhaqCSw7hJJKDIcKlNCt6TMToAjPqnEItno4JHv2q0zkY7iaavUFWvVom6Lcukw/exec";
  const savedURL = localStorage.getItem("savedURL");
  if (!savedURL) {
    return 0;
  }
  const match = savedURL.match(/\/folders\/([^/?]+)/);
  const folderId = match ? match[1] : null;

  if (folderId === null) {
    return 0;
  } else {
    try {
      const response = await fetch(`${webAppUrl}?folderId=${folderId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      const parsedArray = result.map((item) => ({
        title: item.title,
        content: JSON.parse(item.content),
      }));
      return parsedArray;
    } catch (error) {
      console.error("Fetch error:", error);
      console.log(`Error: ${error.message}`);
    }
  }
}
