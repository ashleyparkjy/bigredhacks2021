import React, { useEffect, useRef } from "react";
// import Cropper from 'react-easy-crop';

const App = () => {
  // useRef is the React way of accessing the DOM elements. What it does is,
  // creating a plain JavaScript object that holds some properties such as
  // current and it’s useful for keeping any mutable value inside.
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const photo2Ref = useRef(null);
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
        console.error("error:", err);
      });
  };

  const paintToCanvas = () => {
    let video = videoRef.current;
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");

    const width = 800;
    const height = 450;
    photo.width = width;
    photo.height = height;

    return setInterval(() => {
      ctx.drawImage(video, 0, 0, width, height);
    }, 200);
  };

  const crop = (sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) => {
    // let video = videoRef.current;
    let photo = photo2Ref.current;
    photo.width = 800;
    photo.height = 450;
    let ctx = photo.getContext("2d");
    // var image = document.getElementById('img');
    var image = document.getElementById("screenshot");
    // var image = new Image();
    // image.src = data;
    image.width = "800";
    image.height = "450";

    ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    console.log("onload called");
    const new_data = photo2Ref.current.toDataURL("image2/jpeg");
    detectMask(new_data.split(",")[1]);
    console.log("crop image");
    console.log("new_data: ", new_data);
    const link = document.createElement("a");
    // link.href = data;
    // link.setAttribute('download', 'myWebcam');
    link.innerHTML = `<img src='${new_data}' alt='thumbnail' id='cropped_img'/>`;

    let strip2 = strip2Ref.current;
    if (strip2.firstChild) {
      strip2.replaceChild(link, strip2.firstChild);
    } else {
      strip2.appendChild(link);
    }

    // let photo = photoRef.current;
    // const new_data = photoRef.current.toDataURL('image2/jpeg');
    // // const new_data = ctx.drawImage(image, dx, dy, dWidth, dHeight);
    // // .toDataURL('croped_img/jpeg');
    // console.log('crop image');
    // console.log('new_data: ', new_data);

    // const link = document.createElement('a');
    // link.href = data;
    // link.setAttribute('download', 'myWebcam');
    // link.innerHTML = `<img src='${new_data}' alt='thumbnail' id='cropped_img'/>`;

    // let strip2 = strip2Ref.current;
    // if (strip2.firstChild) {
    //   strip2.replaceChild(link, strip2.firstChild);
    // } else {
    //   strip2.appendChild(link);
    // }
  };

  // const getCoord = (data) => {
  //   // build request header to send to vision api
  //   // const request =
  //   // send request to vision api
  //   // given response, crop image with x,y coordinates
  // };
  let faceCoords = undefined;
  const getCoord = (data) => {
    // build request header to send to vision api
    const request = {
      requests: [
        {
          image: {
            content: data,
          },
          features: [
            {
              maxResults: 10,
              type: "FACE_DETECTION",
            },
          ],
        },
      ],
    };
    console.log(request);
    try {
      fetch("https://vision.googleapis.com/v1/images:annotate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "Bearer ya29.c.Kp8BEQimwSN7X1aTJNH_rbNaSwlLeYr1G1Uqf-4pmSLcP_zfiuetryX_jaU9nk399a8RUnnhTs94kMGEJyLnHOzoNF8am48Os5vkRFbOiWA6vnNnqSJEoBGrcUD3PDAsK-61IPKohiLIBY-bG1vRlUVRPAfnao64IalWCzqt8GzomVlCRBxbZIqbezV4dLaYi1OAlbZ7kI_nVr_gDEwjf4Ic...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................",
        },
        body: JSON.stringify(request),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          console.log(data.responses[0].faceAnnotations);
          let faceAnnotations = data.responses[0].faceAnnotations;

          for (let i = 0; i < faceAnnotations.length; i++) {
            console.log(faceAnnotations[i].fdBoundingPoly.vertices);
          }
          console.log("Test");
          faceCoords = faceAnnotations[0].fdBoundingPoly.vertices;
          console.log(faceCoords);
        })
        .then(() => {
          const xDiff = faceCoords[1].x - faceCoords[0].x;
          const yDiff = faceCoords[2].y - faceCoords[0].y;
          const diff = Math.min(xDiff, yDiff);
          console.log(xDiff);
          crop(
            faceCoords[0].x,
            faceCoords[0].y,
            diff,
            diff,
            faceCoords[0].x,
            faceCoords[0].y,
            diff,
            diff
          );
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
    return faceCoords;

    // send request to vision api

    // given response, crop image with x,y coordinates
  };

  const detectMask = (data) => {
    const request = {
      instances: [
        {
          content: data,
        },
      ],
      parameters: {
        confidenceThreshold: 0.5,
        maxPredictions: 5,
      },
    };
    try {
      fetch(
        "https://us-central1-aiplatform.googleapis.com/v1/projects/mask-detector-327103/locations/us-central1/endpoints/4703710743625728000:predict",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization:
              "Bearer ya29.a0ARrdaM9vSyTV_W1ZcN133u8IG6nKoLaKh0vHj0zlk98-MP2lOgu_9xOcCeOOf4Nm5566Wu46jybgArlXm37ew-fA7AOQLjaHd4jocHwXDUZ2nSLWB620ab4Ttq9ua0qeGnpuumU4wZ6eP3iNEl7lp6vBw2Oy4Yj_pEWGVg",
          },
          body: JSON.stringify(request),
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const takePhoto = async () => {
    let photo = photoRef.current;
    let strip = stripRef.current;

    console.warn(strip);

    // IMAGE DATA
    const data = photo.toDataURL("image/jpeg");
    console.warn(data);
    // send request to vertex AI
    getCoord(data.split(",")[1]);

    const link = document.createElement("a");
    // link.href = data;
    // link.setAttribute('download', 'myWebcam');
    link.innerHTML = `<img src='${data}' alt='thumbnail' id='screenshot'/>`;

    if (strip.firstChild) {
      strip.replaceChild(link, strip.firstChild);
    } else {
      strip.appendChild(link);
    }
  };

  return (
    <div>
      <h1 style={{ margin: "10px", textAlign: "center", fontSize: 50 }}>
        {" "}
        Mask Detector{" "}
      </h1>
      <video
        onCanPlay={() => paintToCanvas()}
        ref={videoRef}
        style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
      />
      <div style={{ margin: "10px" }}>
        <button onClick={() => takePhoto()}>Take a photo</button>
      </div>
      <canvas ref={photoRef} style={{ display: "none" }} />
      <div style={{ margin: "10px" }}>
        <div ref={stripRef} />
      </div>
      <canvas ref={photo2Ref} style={{ display: "none" }} />
      <div style={{ margin: "10px" }}>
        <div ref={strip2Ref} />
      </div>
    </div>
  );
};

export default App;
