export const calculateAngle = (pointA, pointB, pointC) => {
  if (!pointA || !pointB || !pointC) return 0;
  
  const vectorBA = {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y
  };
  
  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y
  };
  
  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magnitudeBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2);
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
  
  if (magnitudeBA === 0 || magnitudeBC === 0) return 0;
  
  const cosine = dotProduct / (magnitudeBA * magnitudeBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosine)));
  
  return Math.round(angle * (180 / Math.PI));
};

export const calculateDistance = (pointA, pointB) => {
  if (!pointA || !pointB) return 0;
  
  return Math.sqrt(
    Math.pow(pointB.x - pointA.x, 2) + 
    Math.pow(pointB.y - pointA.y, 2)
  );
};