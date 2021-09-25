import React, { useEffect, useRef } from 'react';
// import Cropper from 'react-easy-crop';

const App = () => {
  // useRef is the React way of accessing the DOM elements. What it does is,
  // creating a plain JavaScript object that holds some properties such as
  // current and it’s useful for keeping any mutable value inside.
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const stripRef = useRef(null);
  const strip2Ref = useRef(null);

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const getVideo = () => {
    // The Navigator interface represents the state and the identity of the
    // user agent. It allows scripts to query it and to register themselves to
    // carry on some activities.
    navigator.mediaDevices
      .getUserMedia({ video: { width: 800 } }) // request access to media, returns promise
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('error:', err);
      });
  };

  const paintToCanvas = () => {
    let video = videoRef.current;
    let photo = photoRef.current;
    let ctx = photo.getContext('2d');

    const width = 320;
    const height = 240;
    photo.width = width;
    photo.height = height;

    return setInterval(() => {
      ctx.drawImage(video, 0, 0, width, height);
    }, 200);
  };

  const crop = (data, dx, dy, dWidth, dHeight) => {
    // let video = videoRef.current;
    let photo = photoRef.current;
    let ctx = photo.getContext('2d');
    // var image = document.getElementById('img');
    var image = new Image();
    image.onload = function () {
      ctx.drawImage(image, dx, dy, dWidth, dHeight);
      console.log('onload called');
    };
    image.src = data;
    // let photo = photoRef.current;
    const new_data = photoRef.current.toDataURL('image2/jpeg');
    // const new_data = ctx.drawImage(image, dx, dy, dWidth, dHeight);
    // .toDataURL('croped_img/jpeg');
    console.log('crop image');
    console.log('new_data: ', new_data);

    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'myWebcam');
    link.innerHTML = `<img src='${new_data}' alt='thumbnail' id='img'/>`;

    let strip2 = strip2Ref.current;
    if (strip2.firstChild) {
      strip2.replaceChild(link, strip2.firstChild);
    } else {
      strip2.appendChild(link);
    }
  };

  // const getCoord = (data) => {
  //   // build request header to send to vision api
  //   // const request =
  //   // send request to vision api
  //   // given response, crop image with x,y coordinates
  // };

  const takePhoto = () => {
    let photo = photoRef.current;
    let strip = stripRef.current;

    console.warn(strip);

    // IMAGE DATA
    const data = photo.toDataURL('image/jpeg');
    console.warn(data);
    // send request to vertex AI
    //

    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'myWebcam');
    link.innerHTML = `<img src='${data}' alt='thumbnail' id='img'/>`;

    if (strip.firstChild) {
      strip.replaceChild(link, strip.firstChild);
    } else {
      strip.appendChild(link);
    }

    crop(data, 40, 20, 10, 10);
  };

  return (
    <div>
      <h1 style={{ margin: '10px' }}> Mask Detector </h1>
      <video
        onCanPlay={() => paintToCanvas()}
        ref={videoRef}
        style={{ margin: '10px' }}
      />
      <div style={{ margin: '10px' }}>
        <button onClick={() => takePhoto()}>Take a photo</button>
      </div>
      <canvas ref={photoRef} style={{ display: 'none' }} />
      <div style={{ margin: '10px' }}>
        <div ref={stripRef} />
      </div>
      <div style={{ margin: '10px' }}>
        <div ref={strip2Ref} />
      </div>
    </div>
  );
};

export default App;
