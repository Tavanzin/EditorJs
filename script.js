import EditorJs from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Columns from '@calumk/editorjs-columns';
import Delimiter from '@editorjs/delimiter';

class Spacer {
  static get toolbox() {
    return {
      title: "Espaço",
      icon: "⬜",
    };
  }

  render() {
    const div = document.createElement("div");
    div.style.height = "30px";
    return div;
  }

  save() {
    return {};
  }
}

const editor = new EditorJs({
  holder: 'editorjs',

  tools: {
    header: {
      class: Header,
      inlineToolbar: [
        'link',
        'bold'
      ],
      config: {
      levels: [2, 3, 4],
      defaultLevel: 3
      },
    },

    list: {
      class: List,
      inlineToolbar: [
        'link',
        'bold'
      ]
    },

    embed: {
      class: Embed,
      inlineToolbar: false,
      config: {
        services: {
          youtube: true,
          coub: true
        }
      },
    },

    spacer: Spacer,

    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: "http://localhost/EditorJsV.2/EditorJs/editor_php/upload_image.php"
        },
        field: "image",
        types: "image/*",
        additionalRequestData: { debug: "true" },
        uploader: {
          uploadByFile(file) {
            console.log("Enviando arquivo:", file);
            const formData = new FormData();
            formData.append("image", file);
    
            return fetch("http://localhost/EditorJsV.2/EditorJs/editor_php/upload_image.php", {
              method: "POST",
              body: formData
            })
            .then(response => response.json())
            .then(result => {
              console.log("Resposta do servidor:", result);
              return result;
            })
            .catch(error => {
              console.error("Erro no upload:", error);
            });
          }
        }
      },
      additionalRequestData: {
        customId: 'imagem'
      }
    },

    columns: {
      class: Columns,
      config: {
        levels: [2, 3, 4],
        EditorJsLibrary: EditorJs,
        tools: {
          header: Header,
          image: ImageTool,
          list: List,
        }
      }
    }

  },
});

let saveBtn = document.getElementById('save');

saveBtn.addEventListener('click', function() {
  editor.save().then((outputData) => {
    salvarData(outputData);
  }).catch((error) => {
    console.log(error);
  })
})

function salvarData(codigo) {
  const nomeArquivo = prompt("Digite o nome do template:");

  if (!nomeArquivo) {
      alert("Nome do template não pode ser vazio");
      return;
  }

  fetch("http://localhost/EditorJsV.2/EditorJs/editor_php/salvar.php", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
          codigo: codigo, 
          nome_arquivo: nomeArquivo 
      }),
  })
  .then(response => response.text())
  .then(data => {
      console.log("Resposta do servidor:", data);
  })
  .catch(error => {
      console.error("Erro ao enviar:", error);
  });
}

//importar

document.getElementById('import').addEventListener('click', function() {
  document.getElementById('template').style.display = 'flex';
  carregarTemplates();
});

document.getElementById('close').addEventListener('click', function() {
  document.getElementById('template').style.display = 'none';
  const menu = document.getElementsByClassName('drop-down-content')[0];
  menu.classList.remove('view-menu');
});

function carregarTemplates() {
  fetch("http://localhost/EditorJsV.2/EditorJs/editor_php/carregar.php", {
    method: "GET",
  })
  .then(response => response.json())
  .then(data => {
    const templateList = document.getElementById('templateList');
    templateList.innerHTML = '';

    
    data.forEach(template => {
      const templateItem = document.createElement('div');
      templateItem.classList.add('template-item');
    
      const templateContent = document.createElement('div');    

      const versaoDiv = document.createElement('div');
      versaoDiv.classList.add('versao');
      versaoDiv.innerHTML = `Última alteração: ${new Date(template.ultima_alter).toLocaleString()}`;

      const dotsButton = document.createElement('button');
      dotsButton.id= 'dots';
    
      const dotsIcon = document.createElement('span');
      dotsIcon.classList.add('material-symbols-outlined');
      dotsIcon.textContent = 'keyboard_arrow_up';

      const dropdown = document.createElement('div');
      dropdown.id = 'dropdownid';
      dropdown.classList.add('drop-down');

      const dropdownContent = document.createElement('div');
      dropdownContent.classList.add('drop-down-content');
      dropdown.appendChild(dropdownContent);
      versaoDiv.appendChild(dropdown);

      dotsButton.appendChild(dotsIcon);
      versaoDiv.appendChild(dotsButton);

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');
    
      const btn1 = document.createElement('button');
      btn1.textContent = 'Aplicar';
      btn1.addEventListener('click', function() {
        aplicarTemplate(template.codigo);
      });
    
      const btn2 = document.createElement('button');
      btn2.textContent = 'Deletar';
      btn2.addEventListener('click', function() {
        deletarTemplate(template.id);
      });
    
      buttonContainer.appendChild(btn1);
      buttonContainer.appendChild(btn2);

      templateContent.innerHTML = `<strong>${template.nome_arquivo}</strong><br>`;
      templateContent.appendChild(versaoDiv);
      templateContent.appendChild(buttonContainer);
    
      templateItem.appendChild(templateContent);
      templateList.appendChild(templateItem);
    
    dotsButton.addEventListener('click', async function() {
      dotsButton.classList.toggle('rotate');
      dropdownContent.classList.toggle('view-menu');
      if (dropdownContent.classList.contains("view-menu")) {
        const versoes = await viewVersion(template.id);
        if (versoes && versoes.length) {
          displayVersions(versoes, dropdownContent, template.id);
        }
      }
    });

  });
})
.catch(error => console.error('Erro ao carregar templates:', error));
}

function viewVersion(id) {
  return fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/versions.php?id=${id}`, {
    method: "GET",
  }) 
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        console.error(data.erro);
        return [];
      } else {
        return data;
      }
    })
    .catch(error => {
      console.error('Erro ao obter as versões:', error);
      return [];
    });
}

function displayVersions(versoes, content, id) {
  content.innerHTML = "";
  versoes.forEach(versao => {
    const button = document.createElement('button');
    
    const span = document.createElement('span');
    if (versao === 1) {
      span.textContent = `Versão: ${versao}.0`;
    } else {
    span.textContent = `Versão: ${versao}`;
    }
    button.appendChild(span);

    const icon = document.createElement('i');
    icon.classList.add('material-symbols-outlined');
    icon.textContent = 'delete';

    button.appendChild(icon);

    icon.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja excluir esta versão?')) {
        fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/deletar.php?ID=${id}&versao=${versao}`, {
          method: 'GET'
        })
        .then(data => {
          viewVersion(id)
            .then(novasVersoes => {
              displayVersions(novasVersoes, content, id);
            })
            .catch(error => console.error('Erro ao atualizar as versões:', error));
        })
      }
    });
    
    button.addEventListener('click', (e) => {
      if (e.target.closest('i')) return;
      aplicarVersao(versao, id);
      document.getElementById('template').style.display = 'none';
      const menu = document.getElementsByClassName('drop-down-content')[0];
      menu.classList.remove('view-menu');
    });

    content.appendChild(button);
  });
}

function aplicarVersao(versao, id){
  fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/carregar.php?versao=${versao}&id=${id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data[0].codigo);
        editor.render(data[0].codigo);
    })
    .catch(error => console.error("Erro ao carregar template:", error));
}

function aplicarTemplate(codigo) {
  editor.render(codigo)
    .then(() => {
      console.log("Template aplicado com sucesso.");
      document.getElementById('template').style.display = 'none';
    })
    .catch((error) => {
      console.error("Erro ao aplicar o template:", error);
    });
  }
  
  function deletarTemplate(id, versao) {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/deletar.php?ID=${id}`, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Template deletado:', data);
        if (data.reset) {
          document.getElementById('template').style.display = 'none';
        }
        carregarTemplates();
        clearTemplate();
    })
    .catch(error => { 
        console.error('Erro ao deletar o template:', error);
    });
}
}

function clearTemplate() {
  editor.render({ blocks: []});
}

// Delete

document.addEventListener("keydown", (event) => {
  if (event.key === "Delete") {
    const currentBlockIndex = editor.blocks.getCurrentBlockIndex();
      
    if (currentBlockIndex !== -1) {

      if (deletedBlock.data.customId === 'imagem') {
        imageUrl = currentBlockIndex.data.file?.url;
       }
      editor.blocks.delete(currentBlockIndex);
      if(imageUrl) {
        deleteImages(imageUrl);
      }
    }
  }
});

document.addEventListener('click', (event) => {
  const dropdowns = document.getElementsByClassName('drop-down-content');
  Array.from(dropdowns).forEach((dropdown) => {
  if (event.target.closest('button')) return;
  if (dropdown.classList.contains("view-menu")){
    if (!event.target.closest('.drop-down-content')) {
      const dotsButton = document.getElementById('dots');
      dotsButton.classList.toggle('rotate');
      dropdown.classList.remove('view-menu');
    } 
  }
  })
});

//view code

const btnView = document.getElementById('view');
const btnEdit = document.getElementById('edit');

btnView.addEventListener('click', function() {
  changeview(this);
})

btnEdit.addEventListener('click', function() {
  changeview(this);
})

function changeview(clickedbtn) {
  const pag = document.getElementById('pag');
  const jsonView = document.getElementById('jsonview');

  btnEdit.classList.toggle('selected');
  btnView.classList.toggle('selected');

  if (clickedbtn === btnView) {
    editor.save().then((outputData) => {
      display(outputData);
    }).catch((error) => {
      console.log(error);
    })
    
    jsonView.style.zIndex = 2;
    pag.style.zIndex = 1;
    } else if (clickedbtn === btnEdit) {
      var text = document.getElementById('jsonDisplay');
      text.content = null;

      pag.style.zIndex = 2;
      jsonView.style.zIndex = 1;
  }
} 

function display(jsoncode){
  var text = document.getElementById('jsonDisplay');
  text.textContent = JSON.stringify(jsoncode, null, 2);
}

function deleteImages(deleteBlock) {
  console.log("teste");
  const allBlocks = editor.blocks.getBlocks();

  for (let block of allBlocks) {
    if (block.type === 'image') {
      const imageData = block.data;
      if (imageData.file.url === deleteBlock.file.url) {
        console.log(deleteBlock.file.url);
        return true;
      } else {
        console.log(deleteBlock.file.url);
        fetch ('http://localhost/EditorJsV.2/EditorJs/editor_php/delete_image.php', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageUrl: deleteBlock.file.url })
        })
        .then(response => response.json())
        .then(data => console.log('url da imagem enviado: ', data))
        .catch(error => console.error('Erro ao enviar URL: ', error));
      }
    }
  }

  return false;
}