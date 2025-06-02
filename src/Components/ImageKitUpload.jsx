import { IKContext, IKUpload } from 'imagekitio-react';
import { useRef } from 'react';


const authenticator = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/posts/upload-auth`);
    if (!response.ok) throw new Error('Auth failed');
    return await response.json();
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};


   

const ImageKitUpload = ({ children, type, setProgress, setData }) => {
  const ref = useRef(null) 

  const onError = (err) => {
    console.log(err);
    toast.error("Image upload failed!");
  };
  const onSuccess = (res) => {
    console.log(res);
    setData(res);
  };
  const onUploadProgress = (progress) => {
    console.log(progress);
    setProgress(Math.round((progress.loaded / progress.total) * 100));
  };

  
  return (
    <IKContext
      publicKey="public_M1CwocNPrdBe2/tkvw11TFaAymc="
      urlEndpoint="https://ik.imagekit.io/hormemusic"
      authenticator={authenticator}
    >
   <IKUpload
        useUniqueFileName
        onError={onError}
        onSuccess={onSuccess}
        onUploadProgress={onUploadProgress}
        className="hidden"
        ref={ref}
        accept={`${type}/*`}
      />
      <div className="cursor-pointer" onClick={() => ref.current.click()}>
        {children}
      </div>
    </IKContext>
  );
};

export default ImageKitUpload;
