class SongQueue {
    constructor() {
      this.items = [];
    }
  
    // Agregar canción a la cola
    enqueue(song) {
      this.items.push(song);
    }
  
    // Eliminar y devolver la primera canción
    dequeue() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items.shift();
    }
  
    // Mostrar toda la cola
    mostrar() {
      return this.items;
    }
  
    // Verificar si la cola está vacía
    isEmpty() {
      return this.items.length === 0;
    }
  
    // Obtener el tamaño de la cola
    size() {
      return this.items.length;
    }
  }
  
  // Versión con prioridad
  class PrioritySongQueue {
    constructor() {
      this.items = [];
    }
  
    // Agregar canción con prioridad
    enqueue(song, priority) {
      const queueElement = { song, priority };
      let added = false;
  
      for (let i = 0; i < this.items.length; i++) {
        if (priority > this.items[i].priority) {
          this.items.splice(i, 0, queueElement);
          added = true;
          break;
        }
      }
  
      if (!added) {
        this.items.push(queueElement);
      }
    }
  
    dequeue() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items.shift().song;
    }
  
    mostrar() {
      return this.items.map(item => ({
        ...item.song,
        priority: item.priority
      }));
    }
  
    isEmpty() {
      return this.items.length === 0;
    }
  
    size() {
      return this.items.length;
    }
  }
  
  module.exports = { SongQueue, PrioritySongQueue };