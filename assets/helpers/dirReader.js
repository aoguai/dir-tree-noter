var dirReader = {};

// assign a file or a directory to the tree object
var assignToObject = function (trees, path, fileName) {
  // 移除开头的斜杠
  path = path.replace(/^[\/\\]/, "");

  if (fileName) {
    // 处理文件
    const fullPath = path ? `${path}/${fileName}` : fileName;
    const parts = fullPath.split("/");
    let current = trees;

    // 创建目录结构
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    // 添加文件
    current[parts[parts.length - 1]] = "file";
  } else {
    // 处理目录
    const parts = path.split("/").filter((p) => p);
    let current = trees;

    // 创建目录结构
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }
};

var calcDepth = function (path) {
  var reg = /\//g;
  return (path.match(reg) || []).length + 1;
};

var newDirectoryApi = function (input, cb, maxDepth) {
  var files = [],
    trees = {};
  var iterate = function (entries, path, resolve) {
    var promises = [];

    if (calcDepth(path) > maxDepth || !entries.length) {
      assignToObject(trees, path);
      return resolve();
    }

    entries.forEach(function (entry) {
      promises.push(
        new Promise(function (resolve) {
          if ("getFilesAndDirectories" in entry) {
            entry.getFilesAndDirectories().then(function (entries) {
              iterate(entries, entry.path + "/", resolve);
            });
          } else {
            if (entry.name) {
              var p = (path + entry.name).replace(/^[\/\\]/, "");
              files.push(p);
              assignToObject(trees, path, entry.name);
            }
            resolve();
          }
        })
      );
    });
    Promise.all(promises).then(resolve);
  };
  input.getFilesAndDirectories().then(function (entries) {
    new Promise(function (resolve) {
      iterate(entries, "/", resolve);
    }).then(cb.bind(null, files, trees));
  });
};

var entriesApi = function (items, cb, maxDepth) {
  var files = [],
    trees = {},
    rootPromises = [];

  function readEntries(entry, reader, oldEntries, cb) {
    var dirReader = reader || entry.createReader();
    dirReader.readEntries(function (entries) {
      var newEntries = oldEntries ? oldEntries.concat(entries) : entries;
      if (entries.length) {
        setTimeout(readEntries.bind(null, entry, dirReader, newEntries, cb), 0);
      } else {
        cb(newEntries);
      }
    });
  }

  function readDirectory(entry, path, resolve) {
    if (!path) path = entry.name;

    path = path.replace(/^[\/\\]/, "");

    if (calcDepth(path) > maxDepth) {
      assignToObject(trees, path);
      return resolve();
    }

    readEntries(entry, 0, 0, function (entries) {
      var promises = [];

      if (!entries.length) {
        assignToObject(trees, path);
        return resolve();
      }

      entries.forEach(function (entry) {
        promises.push(
          new Promise(function (resolve) {
            if (entry.isFile) {
              entry.file(function (file) {
                assignToObject(trees, path, entry.name);
                files.push(path + "/" + entry.name);
                resolve();
              }, resolve.bind(null));
            } else if (entry.isDirectory) {
              readDirectory(entry, path + "/" + entry.name, resolve);
            }
          })
        );
      });
      Promise.all(promises).then(resolve.bind(null));
    });
  }

  [].slice.call(items).forEach(function (entry) {
    entry = entry.webkitGetAsEntry();
    if (entry) {
      rootPromises.push(
        new Promise(function (resolve) {
          if (entry.isFile) {
            entry.file(function (file) {
              files.push(file.name);
              assignToObject(trees, "", file.name);
              resolve();
            }, resolve.bind(null));
          } else if (entry.isDirectory) {
            readDirectory(entry, entry.name, resolve);
          }
        })
      );
    }
  });
  Promise.all(rootPromises).then(cb.bind(null, files, trees));
};

var arrayApi = function (input, cb) {
  var files = [],
    trees = {};

  [].slice.call(input.files).forEach(function (file) {
    var filePath = file.webkitRelativePath || file.name;
    files.push(filePath);

    if (file.webkitRelativePath) {
      const parts = file.webkitRelativePath.split("/");
      let current = trees;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = "file";
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    } else {
      trees[file.name] = "file";
    }
  });

  // console.log("Generated tree structure:", JSON.stringify(trees, null, 2));
  cb(files, trees);
};

dirReader.exec = function (input, options) {
  const { maxDepth, onComplete } = options;

  if ("getFilesAndDirectories" in input) {
    newDirectoryApi(input, onComplete, maxDepth);
  } else if (
    input.items &&
    input.items.length &&
    "webkitGetAsEntry" in input.items[0]
  ) {
    entriesApi(input.items, onComplete, maxDepth);
  } else if (input.files) {
    arrayApi(input, onComplete);
  } else {
    onComplete();
  }
};

export default dirReader;
