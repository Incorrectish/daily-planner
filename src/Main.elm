module Main exposing (main)

import Browser
import Html exposing (Html, div, text, button)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick, onMouseDown, onMouseUp)
import List.Extra


-- MAIN

main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


-- MODEL

type alias Model =
    { tasks : List String
    , dragging : Maybe Int
    }


init : () -> (Model, Cmd Msg)
init _ =
    ( { tasks = [ "Task 1", "Task 2" ]
      , dragging = Nothing
      }, Cmd.none )


-- UPDATE

type Msg
    = StartDrag Int
    | StopDrag
    | MoveTask Int


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        StartDrag index ->
            ( { model | dragging = Just index }, Cmd.none )

        StopDrag ->
            ( { model | dragging = Nothing }, Cmd.none )

        MoveTask index ->
            case model.dragging of
                Just fromIndex ->
                    ( { model | tasks = move fromIndex index model.tasks }, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )

-- Move helper functions
insertAt : Int -> a -> List a -> List a
insertAt index item list =
    let
        (before, after) = List.Extra.splitAt index list
    in
    before ++ (item :: after)

move : Int -> Int -> List String -> List String
move fromIndex toIndex list =
    let
        item = List.Extra.getAt fromIndex list |> Maybe.withDefault ""
    in
    insertAt toIndex item <| List.Extra.removeAt fromIndex list


-- VIEW

view : Model -> Html Msg
view model =
    div []
        (List.indexedMap (viewTask model.dragging) model.tasks)


viewTask : Maybe Int -> Int -> String -> Html Msg
viewTask dragging index task =
    div
        [ onMouseDown (StartDrag index)
        , onMouseUp StopDrag
        , style "margin" "5px"
        , style "padding" "5px"
        , style "background-color" (if dragging == Just index then "gray" else "lightgray")
        , style "cursor" "pointer"
        ]
        [ text task ]


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none
