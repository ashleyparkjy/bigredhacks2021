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
            "Bearer ya29.c.Kp8BEQjREaTQ7MH6nYAumueziSkLkuol8Xo8IbOjng9l9ePc5OQ3DXeCZ7Yr5AGnCYCyCoa4AiGML4EI41tCAnnGF5wjDQ0OufGtULMQ8iNRe6LXucTQ5oUAfDY-uI2cXeAXG66tG7p_EIpgRhukqAKlFYdH2YcugkX6e5TyKbUPI3gvQq4ixK8pmO6xb_Ey-aMmTGBaaEWT1pcrToDSVu6n...............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................",
        },
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.log(error);
    }
    // send request to vision api
    // given response, crop image with x,y coordinates
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
      <h1 style={{ margin: "10px" }}> Mask Detector </h1>
      <video
        onCanPlay={() => paintToCanvas()}
        ref={videoRef}
        style={{ margin: "10px" }}
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
