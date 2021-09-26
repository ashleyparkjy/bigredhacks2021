import React, { useEffect, useRef } from 'react';
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

  const crop = (data, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) => {
    // let video = videoRef.current;
    let photo = photo2Ref.current;
    photo.width = 800;
    photo.height = 450;
    let ctx = photo.getContext('2d');
    // var image = document.getElementById('img');
    var image = document.getElementById("screenshot");  
    image.width ="800";
    image.height ="450";
    image.onload = function () {
      ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      console.log('onload called');
      const new_data = photo2Ref.current.toDataURL('image2/jpeg');
      console.log('crop image');
      console.log('new_data: ', new_data);
      const link = document.createElement('a');
      // link.href = data;
      // link.setAttribute('download', 'myWebcam');
      link.innerHTML = `<img src='${new_data}' alt='thumbnail' id='cropped_img'/>`;
  
      let strip2 = strip2Ref.current;
      if (strip2.firstChild) {
        strip2.replaceChild(link, strip2.firstChild);
      } else {
        strip2.appendChild(link);
      }
    };
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
            "Bearer ya29.c.Kp8BEQgLbLHcSU3MvmwJFs4txeesUJt8uFC0St0B3QRq8OZ6XZvyXifHUccUf3PqNXLK_TBym96pVAURMPMapBS20IxZ9uh1mdRYkpeQz4eWKVyHREZ-jarPMvTo9sJdV7Ezx0B3RkskBQkBXif5mDzyPTN3YLj6f3iZH4B3oW87U2p-1InYz6VYo6BAZ0qaOuLfHg4E8FcVM-Cz506AJ7q7...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................",
        },
        body: JSON.stringify(request),
      }).then(response => response.json())
        .then(data => {
          console.log(data);
          console.log(data.responses[0].faceAnnotations)
          let faceAnnotations = data.responses[0].faceAnnotations;

          for (let i = 0; i < faceAnnotations.length; i++) {
            console.log(faceAnnotations[i].boundingPoly.vertices);
          }

          let faceCoords = faceAnnotations[0].boundingPoly.vertices

        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
    detectMask(data);
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
              "Bearer ya29.a0ARrdaM9JQx8oBt5qzAe_ee3mL6VfsPDTSeiuCV4mA6QiDJ1QnVStlbv6qmPQc11pdzv32RkXQdtk91Nmofpjv1Fg-R0ojNZD3l50vSsSjeaYNMNRJ33-DqgyjfohC_Grawd1YM_OC8AafJFTCL_DN-z4KlgoKQopiPqt4A",
          },
          body: JSON.stringify(request),
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const takePhoto = () => {
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

    crop(data, 150, 100, 400, 200, 150, 100, 400, 200);
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
      <div style={{ margin: '10px' }}>
        <div ref={strip2Ref} />
      </div>
    </div>
  );
};

export default App;
