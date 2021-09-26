import React, { useEffect, useRef } from "react";

const App = () => {
  // useRef is the React way of accessing the DOM elements. What it does is,
  // creating a plain JavaScript object that holds some properties such as
  // current and it’s useful for keeping any mutable value inside.
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const stripRef = useRef(null);

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

    const width = 320;
    const height = 240;
    photo.width = width;
    photo.height = height;

    return setInterval(() => {
      ctx.drawImage(video, 0, 0, width, height);
    }, 200);
  };

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
    link.href = data;
    link.setAttribute("download", "myWebcam");
    link.innerHTML = `<img src='${data}' alt='thumbnail'/>`;

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
    </div>
  );
};

export default App;
