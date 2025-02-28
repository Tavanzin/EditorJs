export default class CarouselTool {
  static get toolbox() {
    return {
      title: 'Carousel',
      icon: '<svg width="20" height="20" viewBox="0 0 20 20"></svg>',
    };
  }

  constructor({ data }) {
    this.data = data || { images: [] };
    this.wrapper = undefined;
    this.transitionTime = 3000;
    this.carouselHeight = 600;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.carousel = document.createElement('div');
    this.carousel.className = 'carousel';
    this.carousel.style.height = `${this.carouselHeight}px`;
    const trackContainer = document.createElement('div');
    trackContainer.className = 'carousel_track-container';
    this.track = document.createElement('ul');
    this.track.className = 'carousel_track';
    if (this.data.images && this.data.images.length) {
      this.data.images.forEach(url => {
        const slide = this.createSlide(url);
        this.track.appendChild(slide);
      });
    } else {
      // MODIFICAÇÃO: Se não houver imagens, solicita a adição imediata de uma imagem
      this.handleImageSelection();
    }
    trackContainer.appendChild(this.track);
    this.carousel.appendChild(trackContainer);
    this.wrapper.appendChild(this.carousel);
    this.startCarousel();
    return this.wrapper;
  }

  renderSettings() {
    const wrapper = document.createElement('div');
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    
    const timeButton = document.createElement('button');
    timeButton.classList.add('inline-btn');
    const timeIcon = document.createElement('span');
    timeIcon.textContent = '⏱';
    timeButton.appendChild(timeIcon);
    const timeText = document.createElement('span');
    timeText.textContent = ' Tempo';
    timeButton.appendChild(timeText);
    timeButton.addEventListener('click', () => {
      this.showModal('Definir Tempo', this.transitionTime, (value) => {
        if (value) {
          this.transitionTime = parseInt(value, 10);
          this.restartCarousel();
        }
      });
    });
    wrapper.appendChild(timeButton);
    
    const sizeButton = document.createElement('button');
    sizeButton.classList.add('inline-btn');
    const sizeIcon = document.createElement('span');
    sizeIcon.textContent = '📏';
    sizeButton.appendChild(sizeIcon);
    const sizeText = document.createElement('span');
    sizeText.textContent = ' Tamanho';
    sizeButton.appendChild(sizeText);
    sizeButton.addEventListener('click', () => {
      this.showModal('Definir Tamanho', this.carouselHeight, (value) => {
        if (value) {
          this.carouselHeight = parseInt(value, 10);
          this.carousel.style.height = `${this.carouselHeight}px`;
        }
      });
    });
    wrapper.appendChild(sizeButton);

    const addImageButton = document.createElement('button');
    addImageButton.classList.add('inline-btn');
    const addIcon = document.createElement('span');
    addIcon.textContent = '➕';
    addImageButton.appendChild(addIcon);
    const addText = document.createElement('span');
    addText.textContent = ' Adicionar Imagem';
    addImageButton.appendChild(addText);
    addImageButton.addEventListener('click', () => {
      this.handleImageSelection();
    });
    wrapper.appendChild(addImageButton);

    const changeImageButton = document.createElement('button');
    changeImageButton.classList.add('inline-btn');
    const changeIcon = document.createElement('span');
    changeIcon.textContent = '🔄';
    changeImageButton.appendChild(changeIcon);
    const changeText = document.createElement('span');
    changeText.textContent = ' Alterar Imagem';
    changeImageButton.appendChild(changeText);
    changeImageButton.addEventListener('click', () => {
      const slides = this.track.querySelectorAll('.carousel_slide');
      if (slides.length > 0) {
        this.handleImageSelection(slides[0]); // altera a primeira imagem
      } else {
        this.handleImageSelection();
      }
    });
    wrapper.appendChild(changeImageButton);

    const removeImageButton = document.createElement('button');
    removeImageButton.classList.add('inline-btn');
    const removeIcon = document.createElement('span');
    removeIcon.textContent = '➖';
    removeImageButton.appendChild(removeIcon);
    const removeText = document.createElement('span');
    removeText.textContent = ' Remover Imagem';
    removeImageButton.appendChild(removeText);
    removeImageButton.addEventListener('click', () => {
      this.handleRemoveSlide();
    });
    wrapper.appendChild(removeImageButton);

    return wrapper;
  }

  showModal(title, defaultValue, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    const heading = document.createElement('h2');
    heading.textContent = title;
    modal.appendChild(heading);
    const divInput = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    divInput.appendChild(input);
    const submitButton = document.createElement('button');
    submitButton.textContent = 'OK';
    divInput.appendChild(submitButton);
    modal.appendChild(divInput);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    submitButton.addEventListener('click', () => {
      const value = input.value;
      callback(value);
      document.body.removeChild(overlay);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  createSlide(src) {
    const li = document.createElement('li');
    li.className = 'carousel_slide';
    const img = document.createElement('img');
    img.className = 'carousel_image';
    img.src = src;
    img.alt = 'imagem';
    li.appendChild(img);
    // REMOVIDO: O clique na imagem não adiciona ou altera a imagem
    return li;
  }

  handleImageSelection(slideElement) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        const uploadedUrl = await this.uploadImage(file);
        if (uploadedUrl) {
          if (slideElement) {
            const img = slideElement.querySelector('.carousel_image');
            img.src = uploadedUrl;
          } else {
            const newSlide = this.createSlide(uploadedUrl);
            this.track.appendChild(newSlide);
            this.updateSlidesPosition();
            this.restartCarousel();
          }
        }
      }
    });
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  handleRemoveSlide() {
    const slides = this.track.querySelectorAll('.carousel_slide');
    if (slides.length > 0) {
      const lastSlide = slides[slides.length - 1];
      this.track.removeChild(lastSlide);
      this.updateSlidesPosition();
      this.restartCarousel();
      // MODIFICAÇÃO: Se não houver mais imagens, remove a ferramenta do template
      if (this.track.children.length === 0 && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
    }
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('http://localhost/EditorJsV.2/EditorJs/editor_php/upload_image.php', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success === 1 && result.file && result.file.url) {
        return result.file.url;
      } else {
        console.error('Falha no upload:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      return null;
    }
  }

  startCarousel() {
    const slides = this.track.querySelectorAll('.carousel_slide');
    slides.forEach((slide, index) => {
      slide.style.left = `${index * 100}%`;
    });
    let currentIndex = 0;
    this.carouselInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      this.track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }, this.transitionTime);
  }

  updateSlidesPosition() {
    const slides = this.track.querySelectorAll('.carousel_slide');
    slides.forEach((slide, index) => {
      slide.style.left = `${index * 100}%`;
    });
  }

  restartCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.startCarousel();
  }

  save(blockContent) {
    const images = Array.from(blockContent.querySelectorAll('.carousel_image')).map(img => img.src);
    return {
      images,
      transitionTime: this.transitionTime,
      carouselHeight: this.carouselHeight,
    };
  }
}
