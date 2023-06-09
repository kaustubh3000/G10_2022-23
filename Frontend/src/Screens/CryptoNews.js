import React, { useState, useEffect } from "react";
import CryptoNewsCard from "../components/CryptoNewsCard";
import useLoading from "../components/hooks/loading-hook";
import Loader from "../components/loader";
import Axios from "axios";
import { Button, Typography, IconButton, Paper, Grid } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "70ch",
    },
  },
  transition: {
    "&:hover": {
      boxShadow: "10px 10px 39px -14px rgba(0,0,0,0.75)",
      transition: "all .3s",
    },
  },
  container: {
    backgroundColor: "#fbfdfd",
    // overflowX: 'hidden',
    flexGrow: 1,
    display: "flex",
    marginTop: "80px",
    marginLeft: "60px",
    width: `calc(100vw - 90px)`,
    padding: "20px",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  button: {
    transition: "all .3s",
    backfaceVisibility: "hidden",

    background: "#E71D35",
    padding: ".8rem 2rem",
    borderRadius: "10px",
    marginTop: "4px",
    fontFamily: "Source Sans Pro",
    fontSize: "1.6rem",
    textTransform: "uppercase",
    color: "#FFFFFF",
    "&:hover": {
      transform: `scale(1.05)`,
      background: "#E71D35",
      boxShadow: "10px 10px 39px -14px rgba(0,0,0,0.75)",
      backfaceVisibility: "hidden",
    },
  },
  root2: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 300,
    margin: "20px auto",
    borderRadius: "30px",
    background: "#0000001c",
    height: "40px",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontSize: "initial",
  },
}));

const CryptoNews = (props) => {
  const {
    match: { params },
  } = props;

  const classes = useStyles();

  const [loading, setLoad, unsetLoad] = useLoading(true);
  const [news, setNews] = useState([]);

  const history = useHistory();

  const [entity, setEntity] = useState("");

  useEffect(() => {
    setLoad();

    if (params && params.coin) {
      const coin = params.coin.toLowerCase();
      var config = {
        method: "get",
        url: `http://localhost:8080/crypto/getLatestNewsByCoin?coin=${coin}`,
        headers: {},
      };

      Axios(config)
        .then(function (res) {
          unsetLoad();
          console.log(res.data);
          setNews(res.data);
        })
        .catch(function (error) {
          unsetLoad();
          console.log(error);
        });
    } else {
      var config = {
        method: "get",
        url: "http://localhost:8080/crypto/latestNews",
        headers: {},
      };

      Axios(config)
        .then(function (res) {
          unsetLoad();
          console.log(res.data);
          setNews(res.data);
        })
        .catch(function (error) {
          unsetLoad();
          console.log(error);
        });
    }
  }, []);

  if (loading) return <Loader />;
  return (
    <div style={{ marginTop: "50px" }}>
      <Paper component="form" className={classes.root2}>
        <InputBase
          className={classes.input}
          placeholder="Search by coin "
          inputProps={{ "aria-label": "search" }}
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
        />
        <a href={`/crypto/search/${entity}`} style={{ textDecoration: "none" }}>
          <IconButton
            // type="submit"
            className={classes.iconButton}
            aria-label="search"
            // onClick={() => history.push(`/crypto/search/${entity}`)}
          >
            <SearchIcon style={{ width: "30px", height: "30px" }} />
          </IconButton>
        </a>
      </Paper>

      {news.length === 0 ? (
        <h2>No news Available</h2>
      ) : (
        news.map((info, index) => (
          <CryptoNewsCard key={index} newsData={info} />
        ))
      )}
    </div>
  );
};

export default CryptoNews;
