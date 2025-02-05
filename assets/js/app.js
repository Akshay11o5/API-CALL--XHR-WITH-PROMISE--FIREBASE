const cl = console.log;

const blogForm = document.getElementById("blogForm");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const useridControl = document.getElementById("userid");
const submitbtn = document.getElementById("submitbtn");
const updatebtn = document.getElementById("updatebtn");
const BlogContainer = document.getElementById("BlogContainer");
const loader = document.getElementById("loader");

const BASE_URL =
  "https://xhr-with-generic-function-default-rtdb.firebaseio.com";
const POST_URL = `${BASE_URL}/posts.json`;

const sweetalert = (title, icon) => {
  swal.fire({
    title,
    icon,
    timer: 3000,
  });
};

const objToPostArray = (obj) =>
  Object.keys(obj).map((key) => ({ ...obj[key], id: key }));

const editonclick = (ele) => {
  let editId = ele.closest(".card").id;

  localStorage.setItem("editId", editId);
  let EditURL = `${BASE_URL}/posts/${editId}.json`;

  makeApiCall("GET", EditURL, null)
    .then((res) => {
      titleControl.value = res.title;
      contentControl.value = res.body;
      useridControl.value = res.userId;
      submitbtn.classList.add("d-none");
      updatebtn.classList.remove("d-none");

      cl(res);
    })
    .catch((err) => {
      sweetalert(err, "error");
    });
};

const templatingblog = (arr) => {
  let result = ``;

  arr.forEach((card) => {
    result += `

     <div class=" mb-4 card" id="${card.id}">
            <div class="card-header">
              <h3 class="m-0">${card.title}</h3>
            </div>
            <div class="card-body">
              <p>
              ${card.body}
              </p>
              <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-sm btn-info"onclick="editonclick(this)">Edit</button>
                <button class="btn btn-sm btn-danger"onclick="removeonclick(this)">Remove</button>
              </div>
            </div>
          </div>
    `;
    BlogContainer.innerHTML = result;
  });
};

const createCard = (obj, Response) => {
  let card = document.createElement("div");
  card.className = `card mb-4`;
  card.id = Response.name;

  card.innerHTML = `

  <div class="card-header">
              <h3 class="m-0">${obj.title}</h3>
            </div>

            <div class="card-body">
              <p>
              ${obj.body}
              </p>
              <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-sm btn-info"onclick="editonclick(this)">Edit</button>
                <button class="btn btn-sm btn-danger"onclick="removeonclick(this)">Remove</button>
              </div>
            </div>
  
  `;

  BlogContainer.append(card);
};

const makeApiCall = (methodName, URL, data) => {
  return new Promise((resolve, reject) => {
    let msgBody = data ? JSON.stringify(data) : null;

    loader.classList.remove("d-none");
    let xhr = new XMLHttpRequest();
    xhr.open(methodName, URL);
    xhr.setRequestHeader("Authorization", "JWT ACCESS_TOKEN from LS");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = () => {
      loader.classList.add("d-none");
      if (xhr.status >= 200 && xhr.status <= 299) {
        let datares = JSON.parse(xhr.response);
        resolve(datares);
      } else {
        reject(xhr.statusText);
      }
    };

    xhr.send(msgBody);
    xhr.onerror = () => {
      loader.classList.add("d-none");
      reject("error");
    };
  });
};

const removeonclick = (ele) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let removeId = ele.closest(".card").id;
      let removeUrl = `${BASE_URL}/posts/${removeId}.json`;

      makeApiCall("DELETE", removeUrl, null)
        .then((res) => {
          ele.closest(".card").remove();
          sweetalert(`Post has been deleted successfully!!!`, "success");
        })
        .catch((err) => {
          sweetalert(err, "error");
        });
    }
  });
};

const fetchAllposts = () => {
  makeApiCall("GET", POST_URL, null)
    .then((res) => {
      let BlogArr = objToPostArray(res);
      templatingblog(BlogArr);
    })

    .catch((err) => {
      sweetalert(err, "error");
    });
};

fetchAllposts();

const blogONsubmit = (eve) => {
  eve.preventDefault();

  let newPost = {
    title: titleControl.value,
    body: contentControl.value,
    userId: useridControl.value,
  };
  blogForm.reset();

  makeApiCall("POST", POST_URL, newPost)
    .then((res) => {
      createCard(newPost, res);
      sweetalert("New post has been created successfully!!!", "success");
    })

    .catch((err) => {
      sweetalert(err, "error");
    });
};

const updateOnClick = () => {
  let updateObj = {
    title: titleControl.value,
    body: contentControl.value,
    userId: useridControl.value,
  };

  let updateId = localStorage.getItem("editId");

  let updateURL = `${BASE_URL}/posts/${updateId}.json`;

  makeApiCall("PATCH", updateURL, updateObj)
    .then((res) => {
      let card = document.getElementById(updateId).children;

      card[0].innerHTML = ` <h3 class="m-0">${res.title}</h3>`;
      card[1].innerHTML = `<p>
              ${res.body}
              </p>`;

      submitbtn.classList.remove("d-none");
      updatebtn.classList.add("d-none");
      sweetalert("post is updated successfully", "success");
    })
    .catch((err) => {
      sweetalert(err, "error");
    });
};

blogForm.addEventListener("submit", blogONsubmit);
updatebtn.addEventListener("click", updateOnClick);
