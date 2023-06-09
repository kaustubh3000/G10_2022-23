import React, { useState } from "react";
import DropzoneAreaExample from "../components/dropzoneareaexample";
import { Button, IconButton } from "@material-ui/core";
import Axios from "axios";
import useLoading from "../components/hooks/loading-hook";
import SmallLoader from "../components/smallLoader";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

const Report = () => {
  const [loading, setLoad, unsetLoad] = useLoading(true);

  const [files, setFiles] = React.useState([]);
  const pass = (data) => {
    setFiles(data);
  };

  const [analysisStatus, setAnalysisStatus] = useState("");
  const [analysisScore, setAnalysisScore] = useState(0);

  console.log(files);
  const handleAnalyse = () => {
    setLoad();
    var formdata = new FormData();
    formdata.append("file", files[0]);

    var config = {
      method: "post",
      url: "http://localhost:8080/report",
      headers: {},
      data: formdata,
    };

    Axios(config)
      .then(function (res) {
        console.log(res.data);
        setAnalysisScore(res.data.analysisResults.document.score);
        setAnalysisStatus(res.data.analysisResults.document.label);
        unsetLoad();
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div>
      <DropzoneAreaExample pass={pass} />
      <div>
        <Button
          style={{
            background: "blue",
            color: "white",
            borderRadius: "10px",
            width: "100px",
            margin: "0 46% 5px",
          }}
          onClick={handleAnalyse}
        >
          Analyse
        </Button>
      </div>

      {loading ? (
        <SmallLoader />
      ) : !loading && analysisStatus === "positive" ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "1.3rem",
            fontWeight: "bold",
          }}
        >
          <p>
            SAPS Smart Analysis claims that the stock of the above company
            will
            <IconButton
              style={{
                padding: "0px",
                color: "green",
              }}
            >
              <ArrowUpwardIcon style={{ fontSize: "-webkit-xxx-large" }} />
            </IconButton>
            with an accuracy of{" "}
            <span style={{ color: "green" }}>{analysisScore * 100} %</span>
          </p>
        </div>
      ) : !loading && analysisStatus === "negative" ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "1.3rem",
            fontWeight: "bold",
          }}
        >
          <p>
            SAPS Smart Analysis claims that the stock of the above company
            will
            <IconButton
              style={{
                padding: "0px",
                color: "red",
              }}
            >
              <ArrowDownwardIcon style={{ fontSize: "-webkit-xxx-large" }} />
            </IconButton>
            with an accuracy of{" "}
            <span style={{ color: "red" }}>{-1 * analysisScore * 100}%</span>
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Report;
