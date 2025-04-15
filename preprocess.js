const fs = require('fs');
const path = require('path');

// Base64 이미지를 파일로 저장하는 함수 (예시)
function convertBase64ToURL(base64Data) {
  const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return base64Data;
  
  const type = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `img-${Date.now()}.${type.split('/')[1]}`;
  const imagePath = path.join(__dirname, 'public', 'images', filename);
  
  fs.writeFileSync(imagePath, buffer);
  return `/images/${filename}`;
}

// 메인 처리
function processData() {
  try {
    const rawData = fs.readFileSync('character_data.json');
    const data = JSON.parse(rawData);

    // 1. 이미지 처리
    data.characters.forEach(char => {
      if (char.image?.startsWith('data:')) {
        char.image = convertBase64ToURL(char.image);
      }
    });

    // 2. 청크 분할
    const CHUNK_SIZE = 100;
    const chunkDir = path.join(__dirname, 'public', 'data_chunks');
    
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    for (let i = 0; i < data.characters.length; i += CHUNK_SIZE) {
      const chunk = {
        characters: data.characters.slice(i, i + CHUNK_SIZE),
        meta: { part: Math.floor(i/CHUNK_SIZE) + 1 }
      };
      fs.writeFileSync(
        path.join(chunkDir, `chunk_${Math.floor(i/CHUNK_SIZE)}.json`),
        JSON.stringify(chunk)
      );
    }

    console.log('전처리 완료! 청크 파일들은 public/data_chunks/에 저장되었습니다.');
  } catch (error) {
    console.error('처리 중 오류 발생:', error);
  }
}

processData();
