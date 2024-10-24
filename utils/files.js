
const filePath = "mydiary/list";
const fileFirstName = "mydiary";
const className = "日记";
const saveFile = async (markdownContent) => {
  const fileSystemEntry = await getFileSystem();
  if(fileSystemEntry){
    try{
      const res = await createFile(fileSystemEntry, markdownContent, `${fileFirstName}-${className}-${new Date().getTime()}.md`)
      return res;
    }catch(e){
      console.error(e)
      return false;
    }
  }else{
    return false;
  }
};

const getFileSystem = () =>{
  return new Promise((resolve, reject) => {

    try {
      // 检查是否在 App 环境中
      if (typeof plus === 'undefined') {
        console.error('plus 对象未定义，可能不在 App 环境中');
        uni.showToast({
          title: '当前环境不支持此操作',
          icon: 'none',
          duration: 2000
        });
        reject(new Error('当前环境不支持此操作'));
      }
  
      // 获取文件系统管理器
      const fs = plus.io;
  
      // 指定保存路径
      // const path = filePath + '_doc/generated_file.md';
      fs.requestFileSystem(fs.PRIVATE_DOC, function (entry) {
        resolve(entry);
        // createFile(entry, markdownContent, `${fileFirstName}-${className}-${new Date().getTime()}.md`)
      }, (error) => {
        uni.showToast({
          title: '获取文件系统失败',
          icon: 'none',
          duration: 2000
        });
        reject(error);
      });
    } catch (error) {
      console.error('生成并保存文件失败:', error);
      uni.showToast({
        title: '生成并保存文件失败',
        icon: 'none',
        duration: 2000
      });
      reject(error);
    }
  });
}

/**
 * 保存文件
 * @param {*} fsEntry 
 * @param {*} markdownContent 
 * @param {*} fileName 
 */
const createFile = (fsEntry, markdownContent, fileName) => {
  return new Promise((resolve, reject) => {
    fsEntry.root.getDirectory(filePath, { create: true }, (entry) => {
      entry.getFile(fileName, { create: true }, (fileEntry) => {
        fileEntry.createWriter((fileWriter) => {
          // 将 Markdown 文本写入文件
          fileWriter.write(markdownContent);
          fileWriter.onwrite = () => {
            console.log('文件保存成功', entry.toLocalURL());
            resolve({path:fileEntry.toLocalURL(),name:fileName});
            uni.showToast({
              title: '文件保存成功',
              icon: 'success',
              duration: 2000
            });
          };
          fileWriter.onerror = (err) => {
            reject(err);
            uni.showToast({
              title: '写入文件失败',
              icon: 'none',
              duration: 2000
            });
          };
  
        }, (err) => {
          reject(err);
          uni.showToast({
            title: '创建文件失败',
            icon: 'none',
            duration: 2000
          });
        });
      }, (err) => {
        reject(err);
        uni.showToast({
          title: '获取文件失败',
          icon: 'none',
          duration: 2000
        });
      });
    },
      (err) => {
        reject('创建或打开文件目录失败')
      }
    )
  });

};

/**
 * 根据path读取文件
 */
const readFile = async (path) => {
  const fileReader = new plus.io.FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = function (e) {
      resolve(e.target.result);
    };
    fileReader.onerror = function (e) {
      reject(e);
    };
    fileReader.readAsText(path);
  });
};

/**
 * 根据path和content更新文件
 */
const updateFile = async (path, content) => {
  const fileWriter = new plus.io.FileWriter(path);
  return new Promise((resolve, reject) => {
    fileWriter.onwriteend = function (e) {
      resolve(e);
    };
    fileWriter.onerror = function (e) {
      reject(e);
    };
    fileWriter.write(content);
  });
};

/**
 * 根据path删除文件
 */
const deleteFile = async (path) => {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(path, function (entry) {
      entry.remove(function () {
        resolve({ success: true });
      }, function (e) {
        reject({success:false, msg:e.massage || e});
      });
    }, function (e) {
      reject({success:false, msg:e.massage || e});
    });
  });
};

const testFileOp = async () => {
  const fs = plus.io;
  fs.requestFileSystem(fs.PRIVATE_DOC, function (fsentry) {
    // 可通过fs进行文件操作 
    console.log("Request file system success!", fsentry.name, fsentry.root);
    fsentry.root.getDirectory('part/doc', { create: true }, (entry) => {
      console.log('文件夹创建成功:', entry)
      console.log(fs.convertLocalFileSystemURL('path/doc'))
      entry.getFile('test.txt', { create: true }, () => {
        console.log('文件创建成功')
      }, (err) => {
        console.log('文件创建失败', err)
      });
      // createNextDirectory(index + 1);
    }, (err) => {
      console.error('创建文件夹失败:', err);
      // errorCallback(err);
    });
  }, function (e) {
    console.log("Request file system failed: " + e.message);
  });
}

export {
  saveFile,
  testFileOp,
  readFile,
  updateFile,
  deleteFile,
}