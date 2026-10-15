export type Review = {
  userId: string;
  _id: string;
  name: string;
  text: string;
  rating: number;
};

export type ReviewListResponse = {
  reviews: Review[];
};

export type TestimonialCardProps = {
  review: Review;
};

export type RatingStarsProps = {
  rating?: number;
};
