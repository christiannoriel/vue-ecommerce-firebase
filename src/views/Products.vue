<template>
  <div class="products">
    <div class="container">
      <div class="intro h-100">
        <div class="row h-100 justify-content-center align-items-center">
          <div class="col-md-6">
            <h3>Products Page</h3>
            <p>Some descriptions...</p>
          </div>
          <div class="col-md-6">
            <img src="/img/svg/products.svg" alt class="img-fluid" />
          </div>
        </div>

        <hr />

        <h3 class="d-inline-block">Product list</h3>
        <button @click="addNew" class="btn btn-primary float-right">Add Product</button>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products">
                <td>{{ product.name }}</td>
                <td>{{ product.price }}</td>
                <td>
                  <button class="btn btn-primary" @click="editProduct(product)">Edit</button>
                  <button class="btn btn-danger" @click="deleteProduct(product)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="productModal" tabindex="-1" role="dialog" aria-labelledby="editLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editLabel">Edit Product</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">

                <div class="row">
                  <!-- main product -->
                  <div class="col-md-8">
                    <div class="form-group">
                      <input type="text" placeholder="Product Name" v-model="product.name" class="form-control">
                    </div>

                    <div class="form-group">
                      <vue-editor v-model="product.description"></vue-editor>
                    </div>
                  </div>
                  <!-- product sidebar -->
                  <div class="col-md-4">
                    <h4 class="display-6">Product Details</h4>
                    <hr>

                    <div class="form-group">
                      <input type="text" placeholder="Product price" v-model="product.price" class="form-control">
                    </div>

                    <div class="form-group">
                      <input type="text" @keyup.188="addTag" placeholder="Product tags" v-model="tag" class="form-control">
                      
                      <div class="d-flex">
                        <p v-for="tag in product.tags">
                            <span class="p-1">{{tag}}</span>
                        </p>

                      </div>
                    </div>
 

                    <div class="form-group">
                      <label for="product_image">Product Images</label>
                      <input type="file" @change="uploadImage" class="form-control">
                    </div>

                    <div class="form-group d-flex">
                      <div class="p-1" v-for="(image, index) in product.images">
                          <div class="img-wrapp">
                              <img :src="image" alt="" width="80px">
                              <span class="delete-img" @click="deleteImage(image,index)">X</span>
                          </div>
                      </div>
                    </div>

                  </div>
                </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button @click="addProduct()" type="button" class="btn btn-primary" v-if="modal === 'new'">Save changes</button>
              <button @click="updateProduct()" type="button" class="btn btn-primary" v-if="modal === 'edit'">Apply changes</button>
            </div>
          </div>
        </div>
      </div>

  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";
import { fb, db } from "../firebase";
export default {
  name: "Products",
  components: {
    VueEditor
  },
  props: {
    msg: String
  },
  data() {
    return {
      products: [],
      product: {
        name: null,
        description: null,
        price: null,
        tags: [],
        images: []
      },
      activeItem: null,
      modal: null,
      tag: null
    };
  },
  firestore() {
    return {
      products: db.collection('products'),
    }
  },
  methods: {
    deleteImage(img, index) {
      
      let image = fb.storage().refFromURL(img);

      this.product.images.splice(index, 1);

      image.delete().then(() => {
        console.log('Image deleted');
      }).catch((error) => {
        console.log('An error occurred');
      });

    },
    addTag() {
      this.product.tags.push(this.tag);
      this.tag = "";
    },
    uploadImage(e) {
      if(e.target.files[0]) {

        let file = e.target.files[0];
        var storageRef = fb.storage().ref('products/'+ file.name);
        let uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', (snapshot) => {
        }, (error) => {
        }, () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.product.images.push(downloadURL);
            console.log('File available at', downloadURL);
          });
        });
      }
    },
    reset() {
      this.product = {
        name: null,
        description: null,
        price: null,
        tags: [],
        images: []
      }
    },
    addNew() {
      this.modal = 'new';
      this.reset();
      $('#productModal').modal('show');
    },
    watcher() {
    
    },
    updateProduct() {
      this.$firestore.products.doc(this.product.id).update(this.product);
      Toast.fire({
        icon: 'success',
        title: 'Updated successfully'
      })
      $('#productModal').modal('hide');
    },
    editProduct(product) {
      this.modal = 'edit';
      this.product = product;
      $('#productModal').modal('show');
    },
    deleteProduct(doc) {

      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.value) {
          this.$firestore.products.doc(doc.id).delete();
          let numImages = this.product.images.length;
          for ( let i=0; i<numImages; i++ ){
            this.deleteImage(this.product.images[0],0);
          }

          Toast.fire({
            icon: 'success',
            title: 'Deleted successfully'
          })

          $('#productModal').modal('hide');
        }
      })
    },
    addProduct() {
      Toast.fire({
        icon: 'success',
        title: 'Added successfully'
      })
      this.$firestore.products.add(this.product);
      $('#productModal').modal('hide');
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.img-wrapp {
  position: relative;
}
.img-wrapp span.delete-img {
  position: absolute;
  top: -14px;
  left: -2px;
}
.img-wrapp span.delete-img:hover {
  cursor: pointer;
}
</style>
