import { Component, OnInit, Inject} from '@angular/core';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishcopy = null;
  dishIds: number[];
  prev: number;
  next: number;
  commentForm: FormGroup;
  comment: Comment;
  errMess: string;
  ratingValue: number;
  formErrors = {
    'author': '',
    'comment': ''
  }

  validationMessages = {
    'author': {
      'required': 'First name is required.',
      'minlength': 'Name must be atleast 2 characters long',
      'maxlength': 'Name cannot be more than 25 characters long'
    },
    'comment': {
      'required': 'Name is required',
      'minLength': 'Must write a message'
    }
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();
  }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);

    this.route.params
      .switchMap((params: Params) => this.dishservice.getDish(+params['id']))
      .subscribe(dish => {this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id)},
        errmess => this.errMess = <any>errmess);
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: 5,
      comment: ['',[Validators.required, Validators.minLength(1)]]
    });

    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); //reset form validation messages
  }

  onValueChanged(data?: any) {
    if(!this.commentForm) {
      return;
    }
    const form = this.commentForm;

    for(const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if(control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for(const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  onInputChange(event: any) {
    this.ratingValue = event.value;
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.rating = this.ratingValue;
    this.comment.date = new Date().toISOString();
    console.log(this.comment);
    this.dishcopy.comments.push(this.comment);
    this.dishcopy.save().subscribe(dish => this.dish = dish);
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  }


  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
}
